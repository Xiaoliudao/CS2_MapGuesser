import type { PublicPlayer, RoomStatus } from "../../shared/types";

export function HostKickButton({
  viewerPlayerId,
  hostPlayerId,
  target,
  status,
  allowFinished = false,
  isKicking = false,
  onKick,
}: {
  viewerPlayerId: string;
  hostPlayerId: string | null;
  target: PublicPlayer;
  status: RoomStatus;
  allowFinished?: boolean;
  isKicking?: boolean;
  onKick: (playerId: string) => void;
}) {
  if (
    viewerPlayerId !== hostPlayerId
    || target.id === hostPlayerId
    || !target.active
    || (status === "finished" && !allowFinished)
  ) return null;

  return (
    <button
      className="host-kick-button"
      type="button"
      aria-label={`Kick ${target.nickname}`}
      disabled={isKicking}
      onClick={() => onKick(target.id)}
    >
      {isKicking ? "KICKING…" : "KICK"}
    </button>
  );
}
