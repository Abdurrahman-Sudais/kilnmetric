// Fictional plant: glazed wall tile 30 × 60 cm, one roller kiln, one product family.

export const product = {name: 'Glazed wall tile 30 × 60', kiln: 'Roller kiln K2', cycle: '58-minute cycle'};

/** Reference firing curve: [minute, °C]. Batch curves are derived from it with the batch's own peak and cooling. */
export const reference = [[0, 40], [8, 280], [16, 620], [24, 900], [31, 1100], [35, 1150], [40, 1150], [44, 960], [50, 780], [58, 140]];

/** Approved process windows: trials may only propose settings inside these. */
export const windows = {
  peak: {label: 'Peak temperature', unit: '°C', range: [1135, 1165], ref: 1150},
  cool: {label: 'Cooling rate (900→600 °C)', unit: '°C/min', range: [22, 34], ref: 30},
};

/** Defect-risk model: logistic, with weights an engineer can read. Features are deviations from the reference. */
export const model = {
  intercept: -3.4,
  features: [
    {key: 'peakDev', label: 'Peak temperature off target', weight: 0.5, value: (b) => Math.abs(b.peak - 1150) / 10},
    {key: 'fastCool', label: 'Faster cooling than usual', weight: 0.55, value: (b) => Math.max(0, b.cool - 30) / 5},
    {key: 'wetBody', label: 'Pressed-body moisture above 5.5%', weight: 0.4, value: (b) => Math.max(0, b.moisture - 5.5) / 0.5},
    {key: 'lot77', label: 'Clay lot L-77', weight: 0.7, value: (b) => (b.clay === 'L-77' ? 1 : 0)},
  ],
};

const bt = (id, day, clay, glaze, peak, cool, moisture, inspected = null) => ({id, day, clay, glaze, peak, cool, moisture, inspected, status: 'open', notes: [], decision: null});
/** inspected: {rate: share rejected, defects: {crazing, cracks, pinholes, warping}} for batches already sorted. */
export const batches = [
  bt('KB-301', 'Mon 4', 'L-75', 'G-12', 1150, 29, 5.4, {rate: 0.031, defects: {crazing: 4, cracks: 6, pinholes: 9, warping: 3}}),
  bt('KB-302', 'Mon 4', 'L-75', 'G-12', 1152, 30, 5.6, {rate: 0.036, defects: {crazing: 5, cracks: 8, pinholes: 8, warping: 4}}),
  bt('KB-303', 'Tue 5', 'L-77', 'G-12', 1149, 31, 5.5, {rate: 0.071, defects: {crazing: 6, cracks: 24, pinholes: 14, warping: 5}}),
  bt('KB-304', 'Tue 5', 'L-77', 'G-12', 1151, 36, 5.7, {rate: 0.118, defects: {crazing: 22, cracks: 41, pinholes: 15, warping: 4}}),
  bt('KB-305', 'Wed 6', 'L-75', 'G-14', 1162, 30, 5.4, {rate: 0.052, defects: {crazing: 5, cracks: 7, pinholes: 6, warping: 21}}),
  bt('KB-306', 'Wed 6', 'L-75', 'G-14', 1148, 37, 5.5, {rate: 0.078, defects: {crazing: 19, cracks: 27, pinholes: 7, warping: 4}}),
  bt('KB-307', 'Thu 7', 'L-77', 'G-14', 1150, 29, 6.3, {rate: 0.094, defects: {crazing: 6, cracks: 33, pinholes: 26, warping: 3}}),
  bt('KB-308', 'Thu 7', 'L-75', 'G-12', 1150, 30, 5.5, {rate: 0.029, defects: {crazing: 4, cracks: 5, pinholes: 8, warping: 3}}),
  bt('KB-309', 'Fri 8', 'L-77', 'G-12', 1153, 35, 6.1),
  bt('KB-310', 'Fri 8', 'L-75', 'G-14', 1139, 30, 5.6),
  bt('KB-311', 'Fri 8', 'L-75', 'G-12', 1150, 30, 5.5),
];

export const roles = [
  {id: 'manager', label: 'Plant Manager', can: ['view', 'note', 'decide', 'plan', 'result', 'export']},
  {id: 'engineer', label: 'Process Engineer', can: ['view', 'note', 'decide', 'plan']},
  {id: 'inspector', label: 'Quality Inspector', can: ['view', 'note', 'result']},
  {id: 'operator', label: 'Kiln Operator', can: ['view', 'note']},
];
export const people = {manager: 'Kunle Adebisi', engineer: 'Hauwa Sani', inspector: 'Joy Nwosu', operator: 'Sule Bako'};
