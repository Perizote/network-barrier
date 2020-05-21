import { compare } from '../src/compare'

it('should be the same', () => {
  expect(compare('/my-path/', '/my-path/')).toBeTruthy()
})

it('should be different', () => {
  expect(compare('/my-path/', '/not-my-path/')).toBeFalsy()
})

it('should match full wildcard', () => {
  expect(compare('/my-path/', '*')).toBeTruthy()
})

it('should match ending wildcard when it is not even necessary', () => {
  expect(compare('/my-path/', '/my-path/*')).toBeTruthy()
})

it('should not match even having ending wildcard', () => {
  expect(compare('/not-my-path/', '/my-path/*')).toBeFalsy()
})

it('should match ending wildcard by doing substitution', () => {
  expect(compare('/my-path/an-id/', '/my-path/*')).toBeTruthy()
})

it('should match middle wildcard', () => {
  expect(compare('/my-path/an-id/more-path/', '/my-path/*/more-path/')).toBeTruthy()
})

it('should not match middle wildcard', () => {
  expect(compare('/my-path/an-id/more-path/', '/not-my-path/*/more-path/')).toBeFalsy()
  expect(compare('/my-path/an-id/more-path/', '/my-path/*/not-more-path/')).toBeFalsy()
})

it('should not match middle wildcard by using it partially', () => {
  expect(compare('/my-path/an-id/more-path/', '/my-path/no-part-*-of-my-path/more-path/')).toBeFalsy()
  expect(compare('/my-path/not-part-of-my-path/more-path/', '/my-path/part-of-my-*/more-path/')).toBeFalsy()
  expect(compare('/my-path/part-of-my-path-not/more-path/', '/my-path/*-of-my-path/more-path/')).toBeFalsy()
})

it('should match middle wildcard by using it partially', () => {
  expect(compare('/my-path/part-of-my-path/more-path/', '/my-path/part-of-my-*/more-path/')).toBeTruthy()
  expect(compare('/my-path/part-of-my-path/more-path/', '/my-path/*-of-my-path/more-path/')).toBeTruthy()
})

it('should not match when having different path part after wildcard', () => {
  expect(compare('/my-path/an-id/more-path/', '/my-path/*/more-different-path/')).toBeFalsy()
})

it('should match starting wildcard when it is not even necessary', () => {
  expect(compare('/more-path/', '*/more-path/')).toBeTruthy()
})

it('should not match even having starting wildcard', () => {
  expect(compare('/my-path/an-id/not-more-path/', '*/more-path/')).toBeFalsy()
  expect(compare('/my-path/an-id/more-path/and-more-path/', '*/more-path/')).toBeFalsy()
  expect(compare('/my-path/an-id/more-path/', '*/more-path/and-more-path/')).toBeFalsy()
})

it('should match starting wildcard by doing substitution', () => {
  expect(compare('/my-path/an-id/more-path/', '*/more-path/')).toBeTruthy()
})

//it('should match multiple wildcards')
//it('should match recursive wildcards (**)')
//it("should match compare('/my-path/something-in-between/more-path/','/my-path/something-*-between/more-path/')")