import { IValidation } from "constructs";

export class WafRegionValidator implements IValidation {
  private scopeType: string;
  private region: string;

  constructor(scopeType: string, region: string) {
    this.scopeType = scopeType;
    this.region = region;
  }

  public validate(): string[] {
    const errors: string[] = [];

    if (this.scopeType !== "CLOUDFRONT" && this.scopeType !== "REGIONAL") {
      errors.push("Scope must be CLOUDFRONT or REGIONAL.");
    }
    if (this.scopeType === "CLOUDFRONT" && this.region !== "us-east-1") {
      errors.push("Region must be us-east-1 when CLOUDFRONT.");
    }

    return errors;
  }
}
