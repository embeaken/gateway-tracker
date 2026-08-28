import type { Project } from "../types";

export const projects: Project[] = [
  {
    name: "Palisades Tunnel Project",
    desc: "This project will drill the first section of tunnel through the NJ Palisades from North Bergen to Hudson County.",
    earthcam:
      "https://share.earthcam.net/public/tJ90CoLmq7TzrY396Yd88DHnIWc3K6LbTCb94NA4Z6s/tonnelle_ave_bridge",
    facts: [
      { label: "Construction status", value: "TBMs being assembled" },
      { label: "Location", value: "North Bergen, NJ" },
    ],
  },
  {
    name: "Palisades TBM Launch Box",
    desc: "This is the view from the tunnel's west portal, where the first TBM is being assembled and launched.",
    earthcam:
      "https://share.earthcam.net/public/tJ90CoLmq7TzrY396Yd88DYh7fIx4oqpKxs7kkPWy_A/palisades_portal_site",
    facts: [
      { label: "Construction status", value: "TBMs being assembled" },
      { label: "Location", value: "North Bergen, NJ" },
    ],
  },
  {
    name: "Hudson County Access Shaft",
    desc: "The first TBMs will drill up to this access shaft in Hudson County. Here they will be replaced by new TBMs that will drill under the Hudson River. Once the tunnel is excavated, this will be the location of a ventilation tower and emergency exit.",
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
      { label: "Construction status", value: "80% complete" },
      { label: "Location", value: "Hudson River" },
    ],
  },
  {
    name: "Manhattan Access Shaft",
    desc: "The Hudson River TBMs will emerge here once they're done drilling. Another ventilation structure will be built here.",
    earthcam:
      "https://share.earthcam.net/public/tJ90CoLmq7TzrY396Yd88O0s3ogRDpd-gZcv_VlnrGM/311_-_11th_ave",
    facts: [
      {
        label: "Construction status",
        value: "Slurry wall installed, prep for shaft excavation in progress",
      },
      { label: "Location", value: "12th Avenue & 30th Street" },
    ],
  },
];
