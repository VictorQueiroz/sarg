export const INCREASE_COUNTER = 'INCREASE_COUNTER';
export const DECREASE_COUNTER = 'DECREASE_COUNTER';

export function increaseCounter() {
    return {
        type: INCREASE_COUNTER
    };
};

export function decreaseCounter() {
    return {
        type: DECREASE_COUNTER
    };
};

export default function(state = 0, action){
    switch(action.type){
        case INCREASE_COUNTER:
            return state + 1;
        case DECREASE_COUNTER:
            return Math.max(0, state - 1);
    }

    return state;
}
