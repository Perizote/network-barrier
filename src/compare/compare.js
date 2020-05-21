import { isStartingWildcard, areEqualAfterWildcard } from './starting'
import { isEndingWildcard, areEqualBeforeWildcard } from './ending'
import { areEqualExceptWildcardPart } from './middle'
import { WILDCARD } from './constants'

function compare(string, regex) {
  if (!regex.includes(WILDCARD)) {
    return string === regex
  }

  if (isEndingWildcard(regex)) return areEqualBeforeWildcard(string, regex)
  if (isStartingWildcard(regex)) return areEqualAfterWildcard(string, regex)

  return areEqualExceptWildcardPart(string, regex)
}

export { compare }