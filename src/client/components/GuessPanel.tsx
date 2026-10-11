import { useEffect, useState } from "react";
import type { ClientEvent } from "../../shared/protocol";
import { getMap, type MapId, type RadarLayerId } from "../../shared/maps";
import { radarMediaUrl } from "../../shared/mediaUrls";
import type { MapPoint } from "../../shared/types";
import { MapSelector } from "./MapSelector";
import { RadarPicker } from "./RadarPicker";

export function GuessPanel({
  questionId,
  round,
  mapPool,
  assetOrigin,
  submitted,
  expired,
  onPhaseChange,
  onSend,
}: {
  questionId: string;
  round: number;
  mapPool: MapId[];
  assetOrigin: string;
  submitted: boolean;
  expired: boolean;
  onPhaseChange?: (phase: "map" | "pinpoint") => void;
  onSend: (event: ClientEvent) => boolean;
}) {
  const [mapId, setMapId] = useState<MapId | null>(null);
  const [layerId, setLayerId] = useState<RadarLayerId>("main");
  const [point, setPoint] = useState<MapPoint | null>(null);

  useEffect(() => {
    setMapId(null);
    setLayerId("main");
    setPoint(null);
  }, [questionId]);

  useEffect(() => {
    onPhaseChange?.(mapId ? "pinpoint" : "map");
  }, [mapId, onPhaseChange]);

  const changeMap = () => {
    if (submitted) return;
    setMapId(null);
    setLayerId("main");
    setPoint(null);
  };

  const confirm = () => {
    if (!mapId || !point || submitted || expired) return;
    onSend({
      type: "guess:submit",
      payload: { round, eventId: crypto.randomUUID(), mapId, layerId, point },
    });
  };

  return (
    <section className={`guess-workspace multiplayer-guess-workspace ${mapId ? "is-pinpoint" : "is-map-selection"}`}>
      {!mapId ? (
        <>
          <div className="map-selection-heading">
            <div className="panel-kicker">STEP 1 · SELECT MAP</div>
            <h2>WHICH MAP IS THIS LOCATION ON?</h2>
            <p>First choose the correct map, then pinpoint the exact location in the next step.</p>
          </div>
          <MapSelector mapPool={mapPool} assetOrigin={assetOrigin} onSelect={(selected) => {
            const firstLayer = getMap(selected).layers[0];
            setMapId(selected);
            setLayerId(firstLayer.id);
            setPoint(null);
          }} disabled={submitted || expired} />
        </>
      ) : (
        <>
          <button className="change-map-button" type="button" onClick={changeMap} disabled={submitted}>← CHANGE MAP</button>
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
                <button
                  key={layer.id}
                  type="button"
                  className={layerId === layer.id ? "is-active" : ""}
                  onClick={() => { setLayerId(layer.id); setPoint(null); }}
                  disabled={submitted || expired}
                >{layer.name}</button>
              ))}
            </div>
          )}
          <RadarPicker
            mapId={mapId}
            layerId={layerId}
            radarUrl={radarMediaUrl(mapId, layerId, assetOrigin)}
            value={point}
            onChange={setPoint}
            disabled={submitted || expired}
          />
          <button className="primary-button confirm-guess" type="button" onClick={confirm} disabled={!point || submitted || expired}>
            {submitted ? "GUESS CONFIRMED ✓" : expired ? "ROUND EXPIRED" : "CONFIRM GUESS"}
          </button>
        </>
      )}
    </section>
  );
}
