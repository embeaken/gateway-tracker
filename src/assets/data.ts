import type { Project } from "../types";

export const projects: Project[] = [
  {
    name: "Palisades Tunnel Project",
    desc: "This project will drill the first section of tunnel through the NJ Palisades from North Bergen to Hudson County.",
    earthcam:
      "https://share.earthcam.net/public/tJ90CoLmq7TzrY396Yd88DHnIWc3K6LbTCb94NA4Z6s/tonnelle_ave_bridge",
    facts: [
      { label: "Construction status", value: "Launch box and TBMs are being assembled" },
      { label: "Location", value: "North Bergen, NJ" },
    ],
  },
  {
    name: "Palisades TBM Launch Box",
    desc: "This is the view from the tunnel's west portal, where the first TBM is being assembled and launched.",
    earthcam:
      "https://share.earthcam.net/public/tJ90CoLmq7TzrY396Yd88DYh7fIx4oqpKxs7kkPWy_A/palisades_portal_site",
    facts: [
      { label: "Construction status", value: "Launch box and TBMs are being assembled" },
      { label: "Location", value: "North Bergen, NJ" },
    ],
  },
  {
    name: "Hudson County Access Shaft",
    desc: "TBMs will drill east from Tonnelle Avenue to this access shaft. The Hudson River Tunnel TBMs will then launch from here.",
    earthcam:
      "https://share.earthcam.net/public/tJ90CoLmq7TzrY396Yd88GNFxpIIqJR7pVbVOesSSvk/hudson_county_shaft_site",
    facts: [
      {
        label: "Construction status",
        value: "Shaft excavation in progress",
      },
      { label: "Location", value: "Hudson County, NJ" },
    ],
  },
  {
    name: "Hudson River Ground Stabilization",
    desc: "The soil beneath the Hudson River is being reinforced to create a stable foundation that the TBMs can drill through.",
    earthcam:
      "https://share.earthcam.net/public/tJ90CoLmq7TzrY396Yd88NgWcY4qcaFR1ARpUFeGtWU/311_-_11th_ave",
    facts: [
      { label: "Construction status", value: "Ground stabilization 80% complete, progress of pier removal unknown" },
      { label: "Location", value: "Hudson River near 30th Street" },
    ],
  },
  {
    name: "Manhattan Access Shaft",
    desc: "The Hudson River TBMs will emerge here when they're done drilling.",
    earthcam:
      "https://share.earthcam.net/public/tJ90CoLmq7TzrY396Yd88O0s3ogRDpd-gZcv_VlnrGM/311_-_11th_ave",
    facts: [
      {
        label: "Construction status",
        value: "Shaft excavation in progress",
      },
      { label: "Location", value: "12th Avenue & 30th Street" },
    ],
  },
  {
    name: "Hudson Yards Concrete Casing – Section 3",
    desc: "This project will connect the new tunnel to Penn Station.",
    earthcam: "https://share.earthcam.net/public/edgenyc/hudson_yards/camera",
    facts: [
      { label: "Construction status", value: "Tunnel roof installation in progress. Substantial completion is expected by the end of 2026." },
      { label: "Location", value: "Hudson Yards between 11th and 12th Avenues" },
    ],
  },
];
