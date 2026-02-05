import type { Project } from '../types'

export const projects: Project[] = [
  {
    name: 'Tonnelle Avenue Bridge',
    desc: 'This project is turning a stretch of Tonnelle Avenue into a bridge that trains will pass under to enter the new Hudson River tunnel from the west. The first Tunnel Boring Machines (TBMs) will start drilling through the Palisades here.',
    earthcam: 'https://share.earthcam.net/tJ90CoLmq7TzrY396Yd88KKPTYvGpuC9sn7UZHiL1L4.tJ90CoLmq7TzrY396Yd88KndwTghhAJ91QbmhhD8hKQ',
    facts: [
      { label: 'Contract Award', value: 'December 2021' },
      { label: 'TBM Launch Point', value: 'First tunneling location' },
      { label: 'Tunnel Length', value: '~1.5 miles through Palisades' },
    ]
  },
  {
    name: 'Palisades Tunnel (Hudson County Access Shaft)',
    desc: 'The first TBMs will drill through the Palisades and end up here in Hudson county, where they will be extracted and replaced by TBMs that will continue drilling under the Hudson River.',
    earthcam: 'https://share.earthcam.net/tJ90CoLmq7TzrY396Yd88KKPTYvGpuC9sn7UZHiL1L4.tJ90CoLmq7TzrY396Yd88KH9bh2NhJbWVpd0qGjtFqY',
    facts: [
      { label: 'Shaft Depth', value: 'Approx. 180 feet' },
      { label: 'Purpose', value: 'TBM extraction and replacement' },
      { label: 'Location', value: 'Hudson County, NJ' },
    ]
  },
  {
    name: 'Hudson River Ground Stabilization',
    desc: 'The ground beneath the Hudson is being strengthened so that the tunnel can be drilled through it.',
    earthcam: 'https://share.earthcam.net/tJ90CoLmq7TzrY396Yd88FEc2KIPXPpEyk01ZY6DV6k.tJ90CoLmq7TzrY396Yd88MxvGIEVbP8q434ixctMxNg',
    facts: [
      { label: 'Method', value: 'Jet grouting stabilization' },
      { label: 'Depth', value: 'Up to 120 feet below riverbed' },
      { label: 'Location', value: 'Hudson River between NJ and NY' },
    ]
  },
  {
    name: 'Manhattan Tunnel',
    desc: 'This project is building an access shaft through which the TBMs will be removed once they emerge in Manhattan.',
    earthcam: 'https://share.earthcam.net/tJ90CoLmq7TzrY396Yd88AalamigCKiwQn4WPzxftJM.tJ90CoLmq7TzrY396Yd88OFHG2cZ-RCafkbJvvWEIZs',
    facts: [
      { label: 'Shaft Depth', value: 'Approx. 140 feet' },
      { label: 'Location', value: 'Manhattan, near Hudson Yards' },
    ]
  },
  {
    name: 'Hudson Yards Concrete Casing - Section 3',
    desc: 'Crews are building a tunnel box below Manhattan that will take trains out of Penn Station, through Hudson Yards, and into the new Hudson River tunnel from the east.',
    earthcam: 'https://share.earthcam.net/tJ90CoLmq7TzrY396Yd88P0bHGwxARMYJSW9OX-yWIs!.tJ90CoLmq7TzrY396Yd88Ghihgs7KQYXaVZwYJQ3kKA!',
    facts: [
      { label: 'Depth', value: 'Approximately 80 feet below street' },
      { label: 'Connection Points', value: 'Penn Station to Hudson River tunnel' },
      { label: 'Construction Method', value: 'Cut-and-cover concrete casing' }
    ]
  },
]
