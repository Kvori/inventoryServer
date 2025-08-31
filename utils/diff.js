import lodash from "lodash"

function getDeepDiff(original, updated) {
    const diff = {};

    for (const key in updated) {
        if (!lodash.isEqual(original[key], updated[key])) {
            diff[key] = updated[key];
        }
    }

    return diff;
}

export default getDeepDiff