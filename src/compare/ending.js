import { WILDCARD } from './constants'

const isEndingWildcard = regex => regex.indexOf(WILDCARD) === regex.length - 1

function areEqualBeforeWildcard(string, regex) {
  const wildcardPosition = regex.indexOf(WILDCARD)
  const stringPartBeforeWildcard = getPartBeforeWildcard(string, wildcardPosition)
  const regexPartBeforeWildcard = getPartBeforeWildcard(regex, wildcardPosition)

  return stringPartBeforeWildcard === regexPartBeforeWildcard
}

function getPartBeforeWildcard(string, wildcardPosition) {
  const START_POSITION = 0
  return string.substring(START_POSITION, wildcardPosition)
}

export { isEndingWildcard, areEqualBeforeWildcard }