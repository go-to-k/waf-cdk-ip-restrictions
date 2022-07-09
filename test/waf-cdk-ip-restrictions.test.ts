import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { WafCdkIpRestrictionsStack } from "../lib/resource/waf-cdk-ip-restrictions-stack";
import _cdkJsonRaw from "../cdk.json";

export type CdkJson = typeof _cdkJsonRaw;

const _cdkJson: CdkJson = _cdkJsonRaw;
const app = new cdk.App({
  context: _cdkJson.context,
});
const region = app.node.tryGetContext("region") ?? "";
const stack = new WafCdkIpRestrictionsStack(app, "WafCdkIpRestrictionsStack", {
  env: {
    region: region,
  },
});
const template = Template.fromStack(stack);

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
