import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { WafCdkIpRestrictionsStack } from "../lib/resource/waf-cdk-ip-restrictions-stack";
import _cdkJsonRaw from "../cdk.json";
import { getIPList } from "../lib/util/get-ip-list";

export type CdkJson = typeof _cdkJsonRaw;

const getTemplate = (scopeType?: string, region?: string): cdk.assertions.Template => {
  const _cdkJson: CdkJson = _cdkJsonRaw;

  if (scopeType !== undefined) _cdkJson.context.scopeType = scopeType;
  if (region !== undefined) _cdkJson.context.region = region;

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
  test("ScopeType: CLOUDFRONT - Region: ap-northeast-1 = Error", () => {
    const scopeType = "CLOUDFRONT";
    const region = "ap-northeast-1";
    expect(() => {
      getTemplate(scopeType, region);
    }).toThrow(/Region must be us-east-1 when CLOUDFRONT./);
  });

  test("ScopeType: CLOUDFRONT - Region: us-east-1 = Success", () => {
    const scopeType = "CLOUDFRONT";
    const region = "us-east-1";
    expect(() => {
      getTemplate(scopeType, region);
    }).not.toThrow(Error);
  });

  test("ScopeType: REGIONAL - Region: ap-northeast-1 = Success", () => {
    const scopeType = "REGIONAL";
    const region = "ap-northeast-1";
    expect(() => {
      getTemplate(scopeType, region);
    }).not.toThrow(Error);
  });

  test("ScopeType: REGIONAL - Region: us-east-1 = Success", () => {
    const scopeType = "REGIONAL";
    const region = "us-east-1";
    expect(() => {
      getTemplate(scopeType, region);
    }).not.toThrow(Error);
  });

  test("ScopeType: INVALID - Region: us-east-1 = Error", () => {
    const scopeType = "INVALID";
    const region = "us-east-1";
    expect(() => {
      getTemplate(scopeType, region);
    }).toThrow(/Scope must be CLOUDFRONT or REGIONAL./);
  });
});

describe("IP List Tests", () => {
  test("iplist-1 = Success", () => {
    const ipListFilePath = "./test/iplists/iplist-1.txt";
    expect(getIPList(ipListFilePath)).toEqual([]);
  });

  test("iplist-2 = Error", () => {
    const ipListFilePath = "./test/iplists/iplist-2.txt";
    expect(() => {
      getIPList(ipListFilePath);
    }).toThrow(/IP CIDR Format is invalid:/);
  });

  test("iplist-3 = Error", () => {
    const ipListFilePath = "./test/iplists/iplist-3.txt";
    expect(() => {
      getIPList(ipListFilePath);
    }).toThrow(/IP CIDR Format is invalid:/);
  });

  test("iplist-4 = Success", () => {
    const ipListFilePath = "./test/iplists/iplist-4.txt";
    expect(getIPList(ipListFilePath)).toEqual(["0.0.0.1/16", "0.0.0.2/32", "0.0.0.3/24"]);
  });

  test("iplist-5 = Error", () => {
    const ipListFilePath = "./test/iplists/iplist-5.txt";
    expect(() => {
      getIPList(ipListFilePath);
    }).toThrow(/IP CIDR Format is invalid:/);
  });

  test("iplist-6 = Error", () => {
    const ipListFilePath = "./test/iplists/iplist-6.txt";
    expect(() => {
      getIPList(ipListFilePath);
    }).toThrow(/IP CIDR Format is invalid:/);
  });
});
