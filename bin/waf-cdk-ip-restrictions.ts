#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { WafCdkIpRestrictionsStack } from "../lib/resource/waf-cdk-ip-restrictions-stack";

const app = new cdk.App();

const region = app.node.tryGetContext("region") ?? "";

new WafCdkIpRestrictionsStack(app, "WafCdkIpRestrictionsStack", {
  env: {
    region: region,
  },
});
