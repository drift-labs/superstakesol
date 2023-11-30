
import {describe, expect, test} from '@jest/globals';
import createAppActions from './appActions';
import { JITO_SOL, M_SOL } from '../constants/lst';

// Todo how do we make a good mock store that can hold state but also be snapshotted?
// This is going to take some thought.
// 
// const storeMock = () => {
//     let state = {};
//     return {
//         get: (key) => state[key],
//         set: (key, value) => {
//         state[key] = value;
//         },
//     };
// }

const mockGet = jest.fn();
const mockSet = jest.fn();
const mockGetCommon = jest.fn();
const mockSetCommon = jest.fn();

describe('src/actions/appActions.ts', () => {
  let actions;

  afterEach(() => {
    mockGet.mockReset();
    mockSet.mockReset();
    mockGetCommon.mockReset();
    mockSetCommon.mockReset();
  });

  test('creates app actions without error', () => {
    actions = createAppActions(mockGet, mockSet, mockGetCommon, mockSetCommon);

    expect(actions).toBeDefined();

    expect(actions).toMatchSnapshot();
  });

  describe('switchActiveLst action', () => {
    test('switchActiveLst sets new state with valid LSTs', () => {
        const jitoSolSymbol = JITO_SOL.symbol;
        const mSolSymbol = M_SOL.symbol;

        actions.switchActiveLst(jitoSolSymbol);
        const setter = mockSet.mock.calls[0][0];
        const state = {};
        setter(state);
        expect(state).toMatchSnapshot();

        actions.switchActiveLst(mSolSymbol);
        const setter2 = mockSet.mock.calls[0][1];
        setter(state);
        expect(state).toMatchSnapshot();
    });

    test('switchActiveLst throws an error with invalid LST', () => {
        const fakeSymbol = 'longLiveSolana';

        expect(() => {
            actions.switchActiveLst(fakeSymbol);
        }).toThrowErrorMatchingSnapshot();
    });
  })
});
