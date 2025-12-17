## Overview

A simple single-file app for calculating weights/reps needed for a resistance training set given the weight, reps, and RPE used in a previous set.

Uses the Berger equation due to close match with the Nuzzo et al 2023 meta-regression curve.

Visit <https://jesse-smith.github.io/setcalc/> for the calculator.

## Usage

### Inputs

- Reference set inputs
  - Reps: self-explanatory
  - Weight: include bar/machine/bodyweight if applicable
  - RPE: Calculated as 10 - RIR (reps in reserve)
- Target set inputs
  - Choose what to calculate (reps or weight)
  - Reps/Weight: The target reps/weight for the new set (whichever isn’t being calculated)
  - RPE: The target RPE for the new set

### Output

- Target set outputs
  - Reps: repeated if input, calculated if not
  - Weight: repeated if input, calculated if not
  - RPE: repeated from inputs
   