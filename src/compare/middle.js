import { areEqualAfterWildcard } from './starting'
import { isEndingWildcard, areEqualBeforeWildcard } from './ending'
import { WILDCARD, SLASH } from './constants'

function areEqualExceptWildcardPart(string, regex) {
  const partIndexIncludingWildcard = getPartIndexIncludingWildcard(regex)
  const regexParts = removePartAtWildcardPosition(regex, partIndexIncludingWildcard)
  const stringParts = removePartAtWildcardPosition(string, partIndexIncludingWildcard)

  if (regexParts !== stringParts) return false

  return areEqualAtWildcardPartPosition(string, regex, partIndexIncludingWildcard)
}

const getPartIndexIncludingWildcard = regex =>
  regex
    .split(SLASH)
    .findIndex(part => part.includes(WILDCARD))

const removePartAtWildcardPosition = (string, partIndexIncludingWildcard) =>
  string
    .split(SLASH)
    .filter((_, index) => index !== partIndexIncludingWildcard)
    .join(SLASH)

function areEqualAtWildcardPartPosition(string, regex, partIndexIncludingWildcard) {
  const regexAtWilcardPartPosition = getPartAtWildcardPosition(regex, partIndexIncludingWildcard)
  const stringAtWilcardPartPosition = getPartAtWildcardPosition(string, partIndexIncludingWildcard)

  if (isEndingWildcard(regexAtWilcardPartPosition)) {
    return areEqualBeforeWildcard(stringAtWilcardPartPosition, regexAtWilcardPartPosition)
  }

  return areEqualAfterWildcard(stringAtWilcardPartPosition, regexAtWilcardPartPosition)
}

const getPartAtWildcardPosition = (string, partIndexIncludingWildcard) =>
  string
    .split(SLASH)
    .find((_, index) => index === partIndexIncludingWildcard)

export { areEqualExceptWildcardPart }