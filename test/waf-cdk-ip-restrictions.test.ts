import { App, assertions } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { ConfigStackProps, configStackProps } from "../lib/config";
import { WafCdkIpRestrictionsStack } from "../lib/resource/waf-cdk-ip-restrictions-stack";
import { getIPList } from "../lib/util/get-ip-list";

const getTemplate = (scopeType?: string, region?: string): assertions.Template => {
  const testScopeType = scopeType ?? configStackProps.config.scopeType;
  const testRegion = region ?? configStackProps?.env?.region ?? "ap-northeast-1";

  const testConfigStackProps: ConfigStackProps = {
    env: {
      region: testRegion,
    },
    config: {
      scopeType: testScopeType,
    },
  };

  const app = new App();
  const stack = new WafCdkIpRestrictionsStack(
    app,
    "WafCdkIpRestrictionsStack",
    testConfigStackProps,
  );

  return Template.fromStack(stack);
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
  test("iplist-empty-correct = Success", () => {
    const ipListFilePath = "./test/iplists/iplist-empty-correct.txt";
    expect(getIPList(ipListFilePath)).toEqual([]);
  });

  test("iplist-cidr-incorrect = Error", () => {
    const ipListFilePath = "./test/iplists/iplist-cidr-incorrect.txt";
    expect(() => {
      getIPList(ipListFilePath);
    }).toThrow(/IP CIDR Format is invalid:/);
  });

  test("iplist-cidr-correct = Error", () => {
    const ipListFilePath = "./test/iplists/iplist-cidr-correct.txt";
    expect(getIPList(ipListFilePath)).toEqual(["0.0.0.1/0", "0.0.0.2/32"]);
  });

  test("iplist-address-incorrect = Error", () => {
    const ipListFilePath = "./test/iplists/iplist-address-incorrect.txt";
    expect(() => {
      getIPList(ipListFilePath);
    }).toThrow(/IP CIDR Format is invalid:/);
  });

  test("iplist-address-correct = Error", () => {
    const ipListFilePath = "./test/iplists/iplist-address-correct.txt";
    expect(getIPList(ipListFilePath)).toEqual([
      "0.0.0.1/32",
      "255.0.0.2/32",
      "0.255.0.3/32",
      "0.0.255.4/32",
      "0.0.0.255/32",
    ]);
  });

  test("iplist-comments-correct = Success", () => {
    const ipListFilePath = "./test/iplists/iplist-comments-correct.txt";
    expect(getIPList(ipListFilePath)).toEqual(["0.0.0.1/16", "0.0.0.2/32"]);
  });

  test("iplist-alphabet-incorrect = Error", () => {
    const ipListFilePath = "./test/iplists/iplist-alphabet-incorrect.txt";
    expect(() => {
      getIPList(ipListFilePath);
    }).toThrow(/IP CIDR Format is invalid:/);
  });

  test("iplist-mix-incorrect = Error", () => {
    const ipListFilePath = "./test/iplists/iplist-mix-incorrect.txt";
    expect(() => {
      getIPList(ipListFilePath);
    }).toThrow(/IP CIDR Format is invalid:/);
  });
});
