import type { Project } from '../types'

export const projects: Project[] = [
  {
    name: 'Tonnelle Avenue Bridge',
    desc: 'This project is clearing the tunnel\'s western approach by turning a portion of Tonnelle Avenue into a bridge that trains can pass under. The first Tunnel Boring Machines (TBMs) are being assembled here ahead of drilling through the Palisades.',
    earthcam: 'https://share.earthcam.net/tJ90CoLmq7TzrY396Yd88KKPTYvGpuC9sn7UZHiL1L4.tJ90CoLmq7TzrY396Yd88KndwTghhAJ91QbmhhD8hKQ',
    facts: [
      { label: 'Contract Award', value: 'December 2021' },
      { label: 'TBM Launch Point', value: 'First tunneling location' },
      { label: 'Tunnel Length', value: '~1.5 miles through Palisades' },
    ]
  },
  {
    name: 'Hudson County Access Shaft',
    desc: 'TBMs will drill through X.X miles of Palisades from the west portal to this access shaft in Hudson county. Here they will be replaced by new TBMs that will drill X.X miles from here to Manhattan.',
    earthcam: 'https://share.earthcam.net/tJ90CoLmq7TzrY396Yd88KKPTYvGpuC9sn7UZHiL1L4.tJ90CoLmq7TzrY396Yd88KH9bh2NhJbWVpd0qGjtFqY',
    facts: [
      { label: 'Shaft Depth', value: 'Approx. 180 feet' },
      { label: 'Purpose', value: 'TBM extraction and replacement' },
      { label: 'Location', value: 'Hudson County, NJ' },
    ]
  },
  {
    name: 'Hudson River Ground Stabilization',
    desc: 'The soft ground beneath the Hudson River requires some reinforcement before the TBMs can safely drill under it. To that end, barges are currently pumping the riverbed with grout.',
    earthcam: 'https://share.earthcam.net/tJ90CoLmq7TzrY396Yd88FEc2KIPXPpEyk01ZY6DV6k.tJ90CoLmq7TzrY396Yd88MxvGIEVbP8q434ixctMxNg',
    facts: [
      { label: 'Method', value: 'Jet grouting stabilization' },
      { label: 'Depth', value: 'Up to 120 feet below riverbed' },
      { label: 'Location', value: 'Hudson River between NJ and NY' },
    ]
  },
  {
    name: 'Manhattan Access Shaft',
    desc: 'The TBMs will emerge here from under the Hudson River, where they can be removed.',
    earthcam: 'https://share.earthcam.net/tJ90CoLmq7TzrY396Yd88AalamigCKiwQn4WPzxftJM.tJ90CoLmq7TzrY396Yd88OFHG2cZ-RCafkbJvvWEIZs',
    facts: [
      { label: 'Shaft Depth', value: 'Approx. 140 feet' },
      { label: 'Location', value: '12th Avenue & 30th Street' },
    ]
  },
  {
    name: 'Hudson Yards Concrete Casing - Section 3',
    desc: 'This is the connection between Penn Station and the Manhattan Access Shaft.',
    earthcam: 'https://share.earthcam.net/tJ90CoLmq7TzrY396Yd88P0bHGwxARMYJSW9OX-yWIs!.tJ90CoLmq7TzrY396Yd88Ghihgs7KQYXaVZwYJQ3kKA!',
    facts: [
      { label: 'Depth', value: 'Approx. 80 feet' },
      { label: 'Connection Points', value: 'Penn Station to Hudson River tunnel' },
      { label: 'Construction Method', value: 'Cut-and-cover concrete casing' }
    ]
  },
]
