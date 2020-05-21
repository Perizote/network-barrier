import { WILDCARD } from './constants'

const isStartingWildcard = regex => regex.indexOf(WILDCARD) === 0

function areEqualAfterWildcard(string, regex) {
  const wildcardPosition = regex.indexOf(WILDCARD)
  const regexPartAfterWildcard = regex.substring(wildcardPosition + 1)
  const stringPartAfterWildcard = string.substring(string.indexOf(regexPartAfterWildcard))

  return stringPartAfterWildcard === regexPartAfterWildcard
}

export { isStartingWildcard, areEqualAfterWildcard }