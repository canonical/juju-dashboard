export const incrementCounts = (status, counts) => {
  if (counts[status]) {
    counts[status] = counts[status] += 1;
  } else {
    counts[status] = 1;
  }
  return counts;
};

const generateOfferCounts = (modelStatusData) => {
  let offerCount = 0;
  Object.entries(modelStatusData["offers"]).forEach((offer) => {
    if (offer[1]["total-connected-count"] > 0) {
      offerCount++;
    }
  });
  return { joined: offerCount };
};

const generateSecondaryCounts = (modelStatusData, segment, selector) =>
  modelStatusData[segment] &&
  Object.entries(modelStatusData[segment]).reduce((counts, section) => {
    const status = section[1][selector].status;
    return incrementCounts(status, counts);
  }, {});

const generateUnitSecondaryCounts = (modelStatusData) => {
  const counts = {};
  let totalUnits = 0;
  const applications = modelStatusData.applications;
  Object.keys(applications).forEach((applicationName) => {
    const units = applications[applicationName].units || [];
    Object.keys(units).forEach((unitId) => {
      const status = units[unitId]["agent-status"].status;
      totalUnits += 1;
      return incrementCounts(status, counts);
    });
  });
  return [counts, totalUnits];
};

export const renderCounts = (countType, modelStatusData) => {
  if (!modelStatusData) return null;
  let chips = null;
  switch (countType) {
    case "localApps":
      chips = generateSecondaryCounts(
        modelStatusData,
        "applications",
        "status"
      );
      break;
    case "units":
      [chips] = generateUnitSecondaryCounts(modelStatusData);
      break;
    case "machines":
      chips = generateSecondaryCounts(
        modelStatusData,
        "machines",
        "agent-status"
      );
      break;
    case "relations":
      chips = null;
      break;
    case "offers":
      chips = generateOfferCounts(modelStatusData);
      break;
    case "remoteApps":
      chips = generateSecondaryCounts(
        modelStatusData,
        "remote-applications",
        "status"
      );
      break;
  }
  return chips;
};
