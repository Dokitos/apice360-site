"use client";

import {
  Map as MapLibreMap,
  Marker as MapLibreMarker,
  Popup as MapLibrePopup,
  type MapOptions,
  type MarkerOptions,
  type PopupOptions,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

/**
 * Cartografia de base.
 *
 * As styles *vector* do Carto — o costume neste componente — não enviam
 * cabeçalhos CORS no endereço das tiles, e o mapa nunca chega a carregar.
 * Já as *raster* do mesmo Carto respondem com Access-Control-Allow-Origin,
 * incluindo as de retina, por isso são estas que usamos.
 *
 * O desenho é o Positron: cinzentos e brancos, sem o amarelo e o verde
 * saturados do OSM padrão, que é o que fazia o mapa parecer de outra época.
 * Assim o único ponto de cor é o marcador laranja da marca.
 *
 * O sufixo @2x pede tiles ao dobro da resolução: em ecrãs modernos, sem
 * isso, o mapa aparece esborratado por muito bem desenhado que esteja.
 */
/**
 * Base "Light Gray Canvas" da Esri: cinzentos suaves, estradas finas e pouca
 * rotulagem. Substitui o OSM padrão, cujos amarelos e verdes saturados são o
 * que fazia o mapa parecer de outra década.
 *
 * O Carto tem um desenho equivalente mas passou a carimbar "API KEY
 * REQUIRED" por cima das tiles de quem não tem conta, e a Stadia e a
 * MapTiler respondem 401 sem chave. Esta é a única cartografia limpa que
 * responde sem registo e com CORS aberto.
 *
 * Atenção ao {z}/{y}/{x}: a Esri troca a ordem de linha e coluna em relação
 * ao esquema habitual do OSM.
 */
const ESRI_BASE = "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas";

function esriRasterStyle(service: "World_Light_Gray_Base" | "World_Dark_Gray_Base"): StyleSpecification {
  return {
    version: 8,
    sources: {
      basemap: {
        type: "raster",
        tiles: [`${ESRI_BASE}/${service}/MapServer/tile/{z}/{y}/{x}`],
        tileSize: 256,
        attribution: "&copy; Esri &copy; OpenStreetMap contributors",
      },
    },
    layers: [{ id: "basemap", type: "raster", source: "basemap" }],
  };
}

const defaultStyles = {
  dark: esriRasterStyle("World_Dark_Gray_Base"),
  light: esriRasterStyle("World_Light_Gray_Base"),
};

type Theme = "light" | "dark";

type MapViewport = {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
};

type MapStyleOption = string | StyleSpecification;
type MapRef = MapLibreMap;

type MapContextValue = {
  map: MapLibreMap | null;
  isLoaded: boolean;
};

const MapContext = createContext<MapContextValue | null>(null);

function getDocumentTheme(): Theme | null {
  if (typeof document === "undefined") return null;
  if (document.documentElement.classList.contains("dark")) return "dark";
  if (document.documentElement.classList.contains("light")) return "light";
  return null;
}

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function useResolvedTheme(themeProp?: Theme): Theme {
  const [detectedTheme, setDetectedTheme] = useState<Theme>(() => getDocumentTheme() ?? getSystemTheme());

  useEffect(() => {
    if (themeProp) return;
    const observer = new MutationObserver(() => {
      const docTheme = getDocumentTheme();
      if (docTheme) setDetectedTheme(docTheme);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (event: MediaQueryListEvent) => {
      if (!getDocumentTheme()) setDetectedTheme(event.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handleSystemChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", handleSystemChange);
    };
  }, [themeProp]);

  return themeProp ?? detectedTheme;
}

function useMap() {
  const context = useContext(MapContext);
  if (!context) throw new Error("useMap must be used within a Map component");
  return context;
}

type MapProps = {
  children?: ReactNode;
  className?: string;
  theme?: Theme;
  styles?: { light?: MapStyleOption; dark?: MapStyleOption };
  viewport?: Partial<MapViewport>;
  onViewportChange?: (viewport: MapViewport) => void;
  loading?: boolean;
} & Omit<MapOptions, "container" | "style">;

function DefaultLoader() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface/50 backdrop-blur-xs">
      <div className="flex gap-1">
        <span className="size-1.5 animate-pulse rounded-full bg-on-surface-variant/60" />
        <span className="size-1.5 animate-pulse rounded-full bg-on-surface-variant/60 [animation-delay:150ms]" />
        <span className="size-1.5 animate-pulse rounded-full bg-on-surface-variant/60 [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function getViewport(map: MapLibreMap): MapViewport {
  const center = map.getCenter();
  return {
    center: [center.lng, center.lat],
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  };
}

const Map = forwardRef<MapRef, MapProps>(function Map(
  { children, className, theme: themeProp, styles, viewport, onViewportChange, loading = false, ...props },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<MapLibreMap | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);
  const styleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const internalUpdateRef = useRef(false);
  const resolvedTheme = useResolvedTheme(themeProp);
  const onViewportChangeRef = useRef(onViewportChange);
  useEffect(() => {
    onViewportChangeRef.current = onViewportChange;
  }, [onViewportChange]);

  const mapStyles = useMemo(
    () => ({ dark: styles?.dark ?? defaultStyles.dark, light: styles?.light ?? defaultStyles.light }),
    [styles],
  );

  useImperativeHandle(ref, () => mapInstance as MapLibreMap, [mapInstance]);

  const clearStyleTimeout = useCallback(() => {
    if (styleTimeoutRef.current) {
      clearTimeout(styleTimeoutRef.current);
      styleTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new MapLibreMap({
      container: containerRef.current,
      style: resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light,
      renderWorldCopies: false,
      attributionControl: { compact: true },
      ...props,
      ...viewport,
    });

    const styleDataHandler = () => {
      clearStyleTimeout();
      styleTimeoutRef.current = setTimeout(() => setIsStyleLoaded(true), 100);
    };
    const loadHandler = () => setIsLoaded(true);
    const moveHandler = () => {
      if (!internalUpdateRef.current) onViewportChangeRef.current?.(getViewport(map));
    };

    map.on("load", loadHandler);
    map.on("styledata", styleDataHandler);
    map.on("move", moveHandler);
    setMapInstance(map);

    return () => {
      clearStyleTimeout();
      map.off("load", loadHandler);
      map.off("styledata", styleDataHandler);
      map.off("move", moveHandler);
      map.remove();
      setMapInstance(null);
      setIsLoaded(false);
      setIsStyleLoaded(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapInstance) return;
    function applyStyle() {
      const nextStyle = resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;
      setIsStyleLoaded(false);
      mapInstance!.setStyle(nextStyle);
    }
    applyStyle();
  }, [resolvedTheme, mapStyles, mapInstance]);

  useEffect(() => {
    if (!mapInstance || !viewport) return;
    internalUpdateRef.current = true;
    mapInstance.jumpTo(viewport);
    requestAnimationFrame(() => {
      internalUpdateRef.current = false;
    });
  }, [mapInstance, viewport]);

  const contextValue = useMemo(
    () => ({ map: mapInstance, isLoaded: isLoaded && isStyleLoaded }),
    [mapInstance, isLoaded, isStyleLoaded],
  );

  return (
    <MapContext.Provider value={contextValue}>
      <div ref={containerRef} className={cn("relative h-full w-full", className)}>
        {(!isLoaded || loading) && <DefaultLoader />}
        {mapInstance && children}
      </div>
    </MapContext.Provider>
  );
});

type MarkerContextValue = {
  marker: MapLibreMarker;
  map: MapLibreMap | null;
};

const MarkerContext = createContext<MarkerContextValue | null>(null);

function useMarkerContext() {
  const context = useContext(MarkerContext);
  if (!context) throw new Error("Marker components must be used within MapMarker");
  return context;
}

type MapMarkerProps = {
  longitude: number;
  latitude: number;
  children: ReactNode;
  onClick?: (event: MouseEvent) => void;
  onMouseEnter?: (event: MouseEvent) => void;
  onMouseLeave?: (event: MouseEvent) => void;
  onDragStart?: (lngLat: { lng: number; lat: number }) => void;
  onDrag?: (lngLat: { lng: number; lat: number }) => void;
  onDragEnd?: (lngLat: { lng: number; lat: number }) => void;
} & Omit<MarkerOptions, "element">;

function MapMarker({
  longitude,
  latitude,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onDragStart,
  onDrag,
  onDragEnd,
  draggable = false,
  ...markerOptions
}: MapMarkerProps) {
  const { map } = useMap();

  // Built with no listeners attached — listener registration reads refs,
  // which must happen in an effect, not during the render that useMemo
  // itself runs in.
  const marker = useMemo(() => {
    return new MapLibreMarker({
      ...markerOptions,
      element: document.createElement("div"),
      draggable,
    }).setLngLat([longitude, latitude]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => onClick?.(event);
    const handleMouseEnter = (event: MouseEvent) => onMouseEnter?.(event);
    const handleMouseLeave = (event: MouseEvent) => onMouseLeave?.(event);
    const handleDragStart = () => {
      const lngLat = marker.getLngLat();
      onDragStart?.({ lng: lngLat.lng, lat: lngLat.lat });
    };
    const handleDrag = () => {
      const lngLat = marker.getLngLat();
      onDrag?.({ lng: lngLat.lng, lat: lngLat.lat });
    };
    const handleDragEnd = () => {
      const lngLat = marker.getLngLat();
      onDragEnd?.({ lng: lngLat.lng, lat: lngLat.lat });
    };

    const el = marker.getElement();
    el?.addEventListener("click", handleClick);
    el?.addEventListener("mouseenter", handleMouseEnter);
    el?.addEventListener("mouseleave", handleMouseLeave);
    marker.on("dragstart", handleDragStart);
    marker.on("drag", handleDrag);
    marker.on("dragend", handleDragEnd);

    return () => {
      el?.removeEventListener("click", handleClick);
      el?.removeEventListener("mouseenter", handleMouseEnter);
      el?.removeEventListener("mouseleave", handleMouseLeave);
      marker.off("dragstart", handleDragStart);
      marker.off("drag", handleDrag);
      marker.off("dragend", handleDragEnd);
    };
  }, [marker, onClick, onMouseEnter, onMouseLeave, onDragStart, onDrag, onDragEnd]);

  useEffect(() => {
    if (!map) return;
    marker.addTo(map);
    return () => {
      marker.remove();
    };
  }, [map, marker]);

  if (marker.getLngLat().lng !== longitude || marker.getLngLat().lat !== latitude) marker.setLngLat([longitude, latitude]);
  if (marker.isDraggable() !== draggable) marker.setDraggable(draggable);

  return <MarkerContext.Provider value={{ marker, map }}>{children}</MarkerContext.Provider>;
}

type MarkerContentProps = {
  children?: ReactNode;
  className?: string;
};

function MarkerContent({ children, className }: MarkerContentProps) {
  const { marker } = useMarkerContext();
  return createPortal(
    <div className={cn("relative cursor-pointer", className)}>{children}</div>,
    marker.getElement(),
  );
}

type MarkerTooltipProps = {
  children: ReactNode;
  className?: string;
} & Omit<PopupOptions, "className" | "closeButton" | "closeOnClick">;

function MarkerTooltip({ children, className, ...popupOptions }: MarkerTooltipProps) {
  const { marker, map } = useMarkerContext();
  const container = useMemo(() => document.createElement("div"), []);
  const prevTooltipOptions = useRef(popupOptions);
  const tooltip = useMemo(() => {
    return new MapLibrePopup({ offset: 16, ...popupOptions, closeOnClick: true, closeButton: false }).setMaxWidth(
      "none",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map) return;
    tooltip.setDOMContent(container);
    const handleMouseEnter = () => tooltip.setLngLat(marker.getLngLat()).addTo(map);
    const handleMouseLeave = () => tooltip.remove();
    marker.getElement()?.addEventListener("mouseenter", handleMouseEnter);
    marker.getElement()?.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      marker.getElement()?.removeEventListener("mouseenter", handleMouseEnter);
      marker.getElement()?.removeEventListener("mouseleave", handleMouseLeave);
      tooltip.remove();
    };
  }, [container, map, marker, tooltip]);

  useEffect(() => {
    if (!tooltip.isOpen()) return;
    const prev = prevTooltipOptions.current;
    if (prev.offset !== popupOptions.offset) tooltip.setOffset(popupOptions.offset ?? 16);
    if (prev.maxWidth !== popupOptions.maxWidth && popupOptions.maxWidth) tooltip.setMaxWidth(popupOptions.maxWidth ?? "none");
    prevTooltipOptions.current = popupOptions;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tooltip, popupOptions.offset, popupOptions.maxWidth]);

  return createPortal(
    <div
      className={cn(
        "pointer-events-none rounded-md bg-ink px-3 py-1.5 text-xs whitespace-nowrap text-white shadow-lg",
        className,
      )}
    >
      {children}
    </div>,
    container,
  );
}

export { Map, useMap, MapMarker, MarkerContent, MarkerTooltip };
