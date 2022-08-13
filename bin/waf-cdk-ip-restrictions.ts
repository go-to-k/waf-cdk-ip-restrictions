#!/usr/bin/env node
import "source-map-support/register";
import { App } from "aws-cdk-lib";
import { WafCdkIpRestrictionsStack } from "../lib/resource/waf-cdk-ip-restrictions-stack";
import { configStackProps } from "../lib/config";

const app = new App();

new WafCdkIpRestrictionsStack(app, "WafCdkIpRestrictionsStack", configStackProps);
