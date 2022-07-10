import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { WafCdkIpRestrictionsStack } from "../lib/resource/waf-cdk-ip-restrictions-stack";
import _cdkJsonRaw from "../cdk.json";

export type CdkJson = typeof _cdkJsonRaw;

const getTemplate = (region?: string, scopeType?: string): cdk.assertions.Template => {
  const _cdkJson: CdkJson = _cdkJsonRaw;

  if (region !== undefined) _cdkJson.context.region = region;
  if (scopeType !== undefined) _cdkJson.context.scopeType = scopeType;

  const app = new cdk.App({
    context: _cdkJson.context,
  });
  const regionContext = app.node.tryGetContext("region") ?? "";
  const stack = new WafCdkIpRestrictionsStack(app, "WafCdkIpRestrictionsStack", {
    env: {
      region: regionContext,
    },
  });
  const template = Template.fromStack(stack);
  return template;
};

describe("Snapshot Tests", () => {
  const template = getTemplate();

  test("Snapshot test", () => {
    expect(template.toJSON()).toMatchSnapshot();
  });
});

describe("Fine-grained Assertions Tests", () => {
  const template = getTemplate();

  test("WebACL created", () => {
    template.resourceCountIs("AWS::WAFv2::WebACL", 1);
  });

  test("IPSet created", () => {
    template.resourceCountIs("AWS::WAFv2::IPSet", 1);
  });

  test("WAF default action is block", () => {
    template.hasResourceProperties("AWS::WAFv2::WebACL", {
      DefaultAction: { Block: {} },
    });
  });

  test("IPSet has addresses", () => {
    template.hasResourceProperties("AWS::WAFv2::IPSet", {
      Addresses: Match.anyValue(),
    });
  });
});

describe("Validation Tests", () => {
  test("SCOPE: CLOUDFRONT - REGION: ap-northeast-1 = Error", () => {
    const region = "ap-northeast-1";
    const scopeType = "CLOUDFRONT";
    expect(() => {
      const template = getTemplate(region, scopeType);
    }).toThrowError(/Region must be us-east-1 when CLOUDFRONT./);
  });

  test("SCOPE: CLOUDFRONT - REGION: us-east-1 = Success", () => {
    const region = "us-east-1";
    const scopeType = "CLOUDFRONT";
    expect(() => {
      const template = getTemplate(region, scopeType);
    }).not.toThrow(Error);
  });

  test("SCOPE: REGIONAL - REGION: ap-northeast-1 = Success", () => {
    const region = "ap-northeast-1";
    const scopeType = "REGIONAL";
    expect(() => {
      const template = getTemplate(region, scopeType);
    }).not.toThrow(Error);
  });

  test("SCOPE: REGIONAL - REGION: us-east-1 = Success", () => {
    const region = "us-east-1";
    const scopeType = "REGIONAL";
    expect(() => {
      const template = getTemplate(region, scopeType);
    }).not.toThrow(Error);
  });

  test("SCOPE: INVALID - REGION: us-east-1 = Error", () => {
    const region = "us-east-1";
    const scopeType = "INVALID";
    expect(() => {
      const template = getTemplate(region, scopeType);
    }).toThrowError(/Scope must be CLOUDFRONT or REGIONAL./);
  });
});

describe("IP List Tests", () => {});
