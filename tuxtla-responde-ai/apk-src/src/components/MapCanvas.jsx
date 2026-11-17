import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { SEVERITY_META, STATUS_META, TYPE_META } from '../constants';
import { resolveUpload } from '../api';

function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
}

export default function MapCanvas({ center, markers = [], onClick, pin, height = 460, zoom = 13 }) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const layerRef = useRef(null);
    const pinRef = useRef(null);
    const onClickRef = useRef(onClick);

    useEffect(() => { onClickRef.current = onClick; }, [onClick]);

    useEffect(() => {
        if (mapRef.current) return;
        const map = L.map(containerRef.current, {
            center: [center.lat, center.lng],
            zoom,
            scrollWheelZoom: true,
        });
        mapRef.current = map;
        layerRef.current = L.layerGroup().addTo(map);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        map.on('click', (e) => {
            if (onClickRef.current) {
                onClickRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
            }
        });

        return () => {
            map.remove();
            mapRef.current = null;
            layerRef.current = null;
            pinRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const layer = layerRef.current;
        if (!layer) return;
        layer.clearLayers();
        markers.forEach((m) => {
            const lat = Number(m.latitude);
            const lng = Number(m.longitude);
            if (Number.isNaN(lat) || Number.isNaN(lng)) return;

            const sev = SEVERITY_META[m.severity] || SEVERITY_META.MEDIA;
            const status = STATUS_META[m.status] || { label: m.status || 'Pendiente', color: '#64748b' };
            const type = TYPE_META[m.type] || { label: m.type || 'Incidente', icon: '📌' };

            const marker = L.circleMarker([lat, lng], {
                radius: 9,
                color: '#ffffff',
                weight: 2,
                fillColor: sev.color,
                fillOpacity: 0.95,
            });

            const img = m.photo_url
                ? `<img src="${escapeHtml(resolveUpload(m.photo_url))}" class="map-popup-img" alt="Evidencia" onerror="this.style.display='none'" />`
                : '';

            marker.bindPopup(`
                <div class="map-popup">
                    <div class="map-popup-title">${type.icon} ${escapeHtml(m.title || type.label)}</div>
                    <div class="map-popup-badges">
                        <span class="badge" style="background:${sev.color}">${sev.label}</span>
                        <span class="badge" style="background:${status.color}">${status.label}</span>
                    </div>
                    ${img}
                    <p class="map-popup-desc">${escapeHtml(m.description || '')}</p>
                </div>
            `);
            marker.addTo(layer);
        });
    }, [markers]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;
        if (pinRef.current) {
            map.removeLayer(pinRef.current);
            pinRef.current = null;
        }
        if (pin && pin.lat != null && pin.lng != null) {
            pinRef.current = L.marker([pin.lat, pin.lng], {
                icon: L.divIcon({
                    className: '',
                    html: '<div class="map-pin">📍</div>',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15],
                }),
            }).addTo(map);
        }
    }, [pin]);

    return <div ref={containerRef} className="map-canvas" style={{ height, width: '100%' }} />;
}
