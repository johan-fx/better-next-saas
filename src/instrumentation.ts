// instrumentation.ts
import { DiagConsoleLogger, DiagLogLevel, diag } from "@opentelemetry/api";

export async function register() {
	// Silencia totalmente el logger interno de OpenTelemetry
	diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.NONE);

	process.env.OTEL_LOG_LEVEL = "NONE";
	process.env.OTEL_SDK_DISABLED = "true";
}
