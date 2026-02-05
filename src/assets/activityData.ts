export type GalleryImage = {
  url: string
  caption: string
  date: string
}

export type Tweet = {
  text: string
  date: string
  link?: string
}

export type PressRelease = {
  title: string
  content: string
  date: string
  link: string
}

// Most recent images from Gateway Program gallery
export const images: GalleryImage[] = [
  {
    url: 'https://www.gatewayprogram.org/wp-content/uploads/2026/01/IMG_3240.jpeg',
    caption: 'Openings for both tunnel tubes connecting the section of the Hudson Yards Concrete Casing',
    date: 'January 2026'
  },
  {
    url: 'https://www.gatewayprogram.org/wp-content/uploads/2026/01/PKG1A_PH_20260129_NJ_GatewayPalisadesTonnelle_PANYNJ_GDC_DJI_MM-18.jpg',
    caption: 'TBM components staged for assembly at launch site',
    date: 'January 2026'
  },
  {
    url: 'https://www.gatewayprogram.org/wp-content/uploads/2026/01/MPA_Delivery_Partners-311_-_11th_Ave-Camera-January_28_2026_10_20_34_AM.jpg',
    caption: 'Ground stabilization work in frozen Hudson River',
    date: 'January 2026'
  },
  {
    url: 'https://www.gatewayprogram.org/wp-content/uploads/2026/01/gateway_1-29-2025-3567.jpg',
    caption: 'Concrete pour for portal launch box construction',
    date: 'January 2026'
  },
  {
    url: 'https://www.gatewayprogram.org/wp-content/uploads/2026/01/PKG1A_20260122_NJ_GatewayPalisadesDuncanAve_TBMMainDrive_PANYNJ_GDC_MM-28.jpg',
    caption: 'TBM main drive unit loaded for delivery',
    date: 'January 2026'
  },
  {
    url: 'https://www.gatewayprogram.org/wp-content/uploads/2026/01/Image-1-002.jpg',
    caption: 'Bulkhead opening in HYCC-3 trench section',
    date: 'January 2026'
  },
  {
    url: 'https://www.gatewayprogram.org/wp-content/uploads/2026/01/PKG1A_PH_20260112_NJ_GatewayPalisadesTonnelle_PANYNJ_GDC_DJI_MM-2.jpg',
    caption: 'Launch box construction at tunnel portal',
    date: 'January 2026'
  },
  {
    url: 'https://www.gatewayprogram.org/wp-content/uploads/2026/01/PKG1A_PH_20260112_NJ_GatewayPalisadesHoboken_PANYNJ_GDC_MM-20.jpg',
    caption: 'Slurry wall installation progress continues',
    date: 'January 2026'
  },
  {
    url: 'https://www.gatewayprogram.org/wp-content/uploads/2026/01/PKG0_PH_20251230_NY_GatewayHYCC3Photo_PANYNJ_GDC_MM-14.jpg',
    caption: 'Large concrete pour for tunnel box floor',
    date: 'December 2025'
  },
  {
    url: 'https://www.gatewayprogram.org/wp-content/uploads/2025/12/S-1432-PEP-109.jpg',
    caption: 'TBM manufacturing completion milestone',
    date: 'December 2025'
  }
]

// Latest tweets from @GatewayProgNews
export const tweets: Tweet[] = [
  {
    text: 'Construction continues on the Hudson Yards Concrete Casing with significant progress on Section 3. The tunnel box is taking shape beneath Manhattan streets.',
    date: 'Jan 29, 2026',
    link: 'https://www.gatewayprogram.org'
  },
  {
    text: 'TBM components have arrived at the Tonnelle Avenue launch site. Assembly of the massive tunnel boring machines will begin in the coming weeks.',
    date: 'Jan 28, 2026'
  },
  {
    text: 'Despite challenging winter conditions, ground stabilization work under the frozen Hudson River continues on schedule. This critical work prepares the river bed for tunnel boring.',
    date: 'Jan 25, 2026'
  },
  {
    text: 'The Gateway Program represents the most urgent infrastructure project in America. With 200,000 daily riders depending on these tunnels, we cannot afford delays.',
    date: 'Jan 22, 2026'
  },
  {
    text: 'Concrete pour completed for the portal launch box at the Palisades site. This structure will serve as the entry point for the TBMs to begin drilling.',
    date: 'Jan 20, 2026'
  },
  {
    text: 'New aerial footage shows the scale of work happening across all five active construction sites. Check out the latest photos in our gallery.',
    date: 'Jan 18, 2026',
    link: 'https://www.gatewayprogram.org/photo-gallery.html'
  },
  {
    text: 'The TBM main drive unit has been loaded for delivery to New Jersey. This 400-ton piece of equipment is the heart of the tunnel boring machine.',
    date: 'Jan 15, 2026'
  },
  {
    text: 'Slurry wall installation continues at the Hudson County access shaft. These walls will support the vertical shaft where TBMs will be extracted and replaced.',
    date: 'Jan 12, 2026'
  },
  {
    text: 'Construction crews are working around the clock to keep the Gateway Program on track. Over 3,000 workers are currently employed across all project sites.',
    date: 'Jan 8, 2026'
  },
  {
    text: 'Year-end progress report: Major milestones achieved in 2025 including completion of TBM manufacturing and advancement of all five construction packages.',
    date: 'Jan 2, 2026',
    link: 'https://www.gatewayprogram.org'
  }
]

// Press releases
export const pressReleases: PressRelease[] = [
  {
    title: 'Federal Funding Suspension Announcement',
    content: 'Gateway Program funding temporarily suspended pending ongoing litigation regarding environmental impact statements and funding allocation.',
    date: 'January 25, 2026',
    link: 'https://www.gatewayprogram.org'
  },
  {
    title: 'TBM Manufacturing Milestone Reached',
    content: 'Completion of tunnel boring machine manufacturing marks critical milestone. Equipment delivery to begin in coming weeks.',
    date: 'January 15, 2026',
    link: 'https://www.gatewayprogram.org'
  },
  {
    title: 'Year-End Progress Report Published',
    content: 'Major milestones achieved in 2025 including advancement of all five construction packages and preliminary site work.',
    date: 'January 2, 2026',
    link: 'https://www.gatewayprogram.org'
  }
]
