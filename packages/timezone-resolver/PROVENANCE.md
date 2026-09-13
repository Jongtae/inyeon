# Timezone data and validation provenance

## Intentional data pin

The resolver pins IANA Time Zone Database release `2026c`, obtained from `https://data.iana.org/time-zones/releases/tzdata2026c.tar.gz`:

- SHA-256: `e4a178a4477f3d0ea77cc31828ff72aa38feff8d61aa13e7e99e142e9d902be4`
- SHA-512: `e0b4b7044b66fbc27bc21d13d18063abcdf78ab58d5ba5fd64bd1a88d86e9d495f45add4d8e65bb6c40249f9c94ca29b72c8ebba8d0e4c468f2965ac77932ef0`

Generation tooling is exact `moment-timezone@0.6.3`, npm integrity `sha512-pVEPA/HCFHHbwJ130ywnzYuZpkEGcP6Daa/OwNebpA18MybeFHmQilAGGovXgWijQ8vQtmud9jZrziUBgsykfg==`, git head `f5373b73ed47995924b53a0cac1e59730799887d`. Its full `data/packed/latest.json` is version `2026c` with SHA-256 `43f7878a298740ff6acabb9c726c7e5431a94bdca79abad274a6fe6e355bfe81`. `moment@2.30.1` is also a direct exact devDependency so Moment Timezone's transitive range cannot change generation; both are fixed by `package-lock.json`.

IANA published `2026d` on 2026-09-11 after Moment Timezone 0.6.3. INYEON intentionally keeps the reviewed 2026c resolver-data pin rather than silently mixing sources. Official `tzcode2026c` compiled both 2026c and 2026d data; `zdump -v -c 1908,2027` produced identical transition-output hashes for all supported zones. The reviewed 2026d data hashes are SHA-256 `0cb2aa8e333c3dc049badc42a0c61f21987b8cd44e107fa900bad764aacc7767` and SHA-512 `1a27de5af50bbc28a2f64c506ab3678b09d9e5ab6c118f39eb38bb823aa8f57069bf5e465848e71df8274c6b8bcd0fc736a88107e5792d816a1db5d867cbc219`. This establishes no selected-zone transition drift through 2026; it does not claim the releases are globally identical or make the resolver production-eligible.

## Generated artifact

`scripts/generate-timezone-data.mjs` selects exactly three canonical zones, unpacks integer east-of-UTC offsets and UTC transition instants, and bounds them with UTC sentinels bracketing the supported civil interval. The committed artifact is not a greenfield timezone database and includes no aliases, countries, coordinates, or place labels.

Runtime lookup is INYEON-owned and dependency-free. For each distinct zone offset it constructs a possible instant, looks up the offset active at that instant, and retains only round-tripping candidates. Therefore a gap yields zero, normal time one, and a fold two candidates; no library disambiguation default participates.

## Independent official-tool fixtures

Fixtures were inspected from the unmodified IANA `asia` and `northamerica` inputs compiled with `zic (tzcode) 2026c`, then enumerated with `zdump (tzcode) 2026c`. Official `tzcode2026c.tar.gz` hashes:

- SHA-256: `b1cffc3ace4c4c7cd0efba2f7add86ec3d0b79da48bcf03582671fd3c8feace8`
- SHA-512: `ad1aadf26b9aaca487a4f780d7a8ebf1d7383472ce587b06cb63852d4eb030dbd190b537e393e75d59530318581e9d3f492ff5f97bbac78f548d0755c4f7257f`

The fixture corpus covers Korea's 1908/1912 standard-offset changes, 1954 fold, 1961 gap, and 1988 DST gap/fold, plus New York and Los Angeles gap/fold rules immediately before and after the 2007 US rule change. Per-zone `zdump -v -c 1908,2027` hashes are recorded in the fixture file.

This evidence validates local-time normalization only. IANA data is civil-time evidence, not a source for Four Pillars, solar-term, day-rollover, or Korean Saju methodology claims.
