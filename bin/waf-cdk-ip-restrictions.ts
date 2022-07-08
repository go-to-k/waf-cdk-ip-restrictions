#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { WafCdkIpRestrictionsStack } from "../lib/waf-cdk-ip-restrictions-stack";

const region = process.env.REGION ?? "";

const app = new cdk.App();
new WafCdkIpRestrictionsStack(app, "WafCdkIpRestrictionsStack", {
  env: {
    region: region,
  },
});
