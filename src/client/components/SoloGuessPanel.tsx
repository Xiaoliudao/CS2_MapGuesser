import { useEffect, useState } from "react";
import { getMap, type MapId, type RadarLayerId } from "../../shared/maps";
import { radarMediaUrl } from "../../shared/mediaUrls";
import type { MapPoint } from "../../shared/types";
import { MapSelector } from "./MapSelector";
import { RadarPicker } from "./RadarPicker";

export interface SoloGuessValue {
  mapId: MapId;
  layerId: RadarLayerId;
  point: MapPoint;
}

export function SoloGuessPanel({
  questionId,
  mapPool,
  assetOrigin,
  hintMapId,
  expired,
  busy,
  onPhaseChange,
  onHint,
  onSubmit,
}: {
  questionId: string;
  mapPool: MapId[];
  assetOrigin: string;
  hintMapId: MapId | null;
  expired: boolean;
  busy: boolean;
  onPhaseChange?: (phase: "map" | "pinpoint") => void;
  onHint: () => Promise<unknown>;
  onSubmit: (guess: SoloGuessValue) => Promise<unknown>;
}) {
  const [mapId, setMapId] = useState<MapId | null>(null);
  const [layerId, setLayerId] = useState<RadarLayerId>("main");
  const [point, setPoint] = useState<MapPoint | null>(null);
  const [confirmingHint, setConfirmingHint] = useState(false);

  useEffect(() => {
    setMapId(null);
    setLayerId("main");
    setPoint(null);
    setConfirmingHint(false);
  }, [questionId]);

  useEffect(() => {
    onPhaseChange?.(mapId ? "pinpoint" : "map");
  }, [mapId, onPhaseChange]);

  useEffect(() => {
    if (!hintMapId) return;
    const firstLayer = getMap(hintMapId).layers[0];
    setMapId(hintMapId);
    setLayerId(firstLayer.id);
    setPoint(null);
    setConfirmingHint(false);
  }, [hintMapId, questionId]);

  const disabled = busy || expired;
  const selectMap = (selected: MapId) => {
    const firstLayer = getMap(selected).layers[0];
    setMapId(selected);
    setLayerId(firstLayer.id);
    setPoint(null);
  };

  return (
    <section className={`guess-workspace solo-guess-workspace ${mapId ? "is-pinpoint" : "is-map-selection"}`}>
      <div className={`solo-hint ${hintMapId ? "is-revealed" : ""}`} aria-live="polite">
        {hintMapId ? (
          <div className="solo-hint-reveal">
            <span>HINT USED ✓</span>
            <strong>THIS LOCATION IS ON {getMap(hintMapId).name.toUpperCase()}</strong>
          </div>
        ) : confirmingHint ? (
          <div className="solo-hint-confirm">
            <span>Reveal the correct map?</span>
            <div>
              <button type="button" onClick={() => setConfirmingHint(false)} disabled={disabled}>CANCEL</button>
              <button className="is-reveal" type="button" onClick={() => void onHint()} disabled={disabled}>REVEAL MAP</button>
            </div>
          </div>
        ) : (
          <button className="solo-hint-button" type="button" onClick={() => setConfirmingHint(true)} disabled={disabled}>
            HINT <span>REVEAL MAP</span>
          </button>
        )}
      </div>

      {!mapId ? (
        <>
          <div className="map-selection-heading">
            <div className="panel-kicker">STEP 1 · SELECT MAP</div>
            <h2>WHICH MAP IS THIS LOCATION ON?</h2>
            <p>First choose the correct map, then pinpoint the exact location in the next step.</p>
          </div>
          <MapSelector mapPool={mapPool} assetOrigin={assetOrigin} onSelect={selectMap} disabled={disabled} />
        </>
      ) : (
        <>
          <button className="change-map-button" type="button" onClick={() => { setMapId(null); setLayerId("main"); setPoint(null); }} disabled={disabled}>← CHANGE MAP</button>
          <div className="radar-title">
            <div className="radar-step-copy">
              <span>STEP 2 · PINPOINT LOCATION</span>
              <small>Now place your marker on the 2D radar to mark the exact spot.</small>
            </div>
            <strong>{getMap(mapId).name}</strong>
          </div>
          {getMap(mapId).layers.length > 1 && (
            <div className="layer-tabs" role="group" aria-label="Radar floor">
              {getMap(mapId).layers.map((layer) => (
                <button key={layer.id} type="button" className={layerId === layer.id ? "is-active" : ""} onClick={() => { setLayerId(layer.id); setPoint(null); }} disabled={disabled}>{layer.name}</button>
              ))}
            </div>
          )}
          <RadarPicker
            mapId={mapId}
            layerId={layerId}
            radarUrl={radarMediaUrl(mapId, layerId, assetOrigin)}
            value={point}
            onChange={setPoint}
            disabled={disabled}
          />
          <button className="primary-button confirm-guess" type="button" onClick={() => point && void onSubmit({ mapId, layerId, point })} disabled={!point || disabled}>
            {busy ? "SUBMITTING…" : expired ? "ROUND EXPIRED" : "CONFIRM GUESS"}
          </button>
        </>
      )}
    </section>
  );
}
