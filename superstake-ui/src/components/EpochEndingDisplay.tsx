import useEpochInfo from "../hooks/useEpochInfo";
import SkeletonValuePlaceholder from "./SkeletonValuePlaceholder";

function formatTime(timeInMs: number) {
  if (!timeInMs || isNaN(timeInMs)) {
    return "unknown";
  }

  const d = Math.floor(timeInMs / 1000 / 60 / 60 / 24);
  const h = Math.floor((timeInMs / 1000 / 60 / 60 / 24 - d) * 24);

  // Probably better not to show minutes, because this is an estimate and not an exact value
  // But if we wanted to, this is how we could do it:
  // const m = Math.floor(((timeInMs / 1000 / 60 / 60 / 24 - d) * 24 - h) * 60);

  if (d <= 0 && h <= 0) {
    return "soon";
  }

  const daysString = d > 0 ? (d > 1 ? `${d} days,` : `${d} day,`) : "";
  const hoursString = h > 0 ? (h > 1 ? `${h} hours` : `${h} hour`) : "";

  return `${daysString} ${hoursString}`;
}

const EpochEndingDisplay = () => {
  const epochInfo = useEpochInfo();

  if (!epochInfo.avgSlotTimeLoaded) {
    return <SkeletonValuePlaceholder loading className="w-20 h-4" />;
  }

  const timeString = formatTime(epochInfo.estimatedTimeRemainingInEpochMs);

  return <>{timeString}</>;
};

export default EpochEndingDisplay;
