import {
  dimensions,
  complexityDimensions,
  readinessDimensions,
} from "../lib/dimensions";

console.log("Total dimensions:", dimensions.length);
console.log("Complexity dimensions:", complexityDimensions.length);
console.log("Readiness dimensions:", readinessDimensions.length);

const shortWhy = dimensions
  .filter((d) => !d.whyItMatters || d.whyItMatters.length < 50)
  .map((d) => d.id);
console.log("Empty / short whyItMatters:", shortWhy);

const withConditional = dimensions
  .filter((d) => d.conditionalNote !== undefined)
  .map((d) => d.id);
console.log("Dimensions with conditionalNote:", withConditional);

const wrongDescriptorCount = dimensions
  .filter((d) => d.scoreDescriptors.length !== 3)
  .map((d) => d.id);
console.log("Dimensions with !=3 score descriptors:", wrongDescriptorCount);
