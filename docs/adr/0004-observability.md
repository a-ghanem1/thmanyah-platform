# ADR 0004: Observability Baseline

## Status
Accepted

## Context
Thmanyah Platform needs consistent request-level visibility without introducing heavy observability infrastructure. The system is early-stage and should focus on simple, reliable diagnostics.

## Decision
Adopt a lightweight observability baseline:
- Propagate a request id via the `X-Request-Id` header.
- Log HTTP requests with method, path, status, duration, and requestId.
- Standardize error responses as `{ statusCode, error, message, path, timestamp }`.

This provides enough information for debugging and incident response while keeping implementation overhead low.

## Options Considered
1) Basic request id + HTTP logs + error shape (chosen).
2) Full tracing and metrics from the start (OpenTelemetry).
3) Minimal logging only.

## Consequences
- Consistent, searchable logs across Studio and Explore.
- Easier correlation of client reports with server logs.
- No distributed tracing or metrics until the next phase.

## How to Validate
- Send requests with and without `X-Request-Id` and confirm the logs include a requestId.
- Trigger a validation error and confirm the response uses the standard error shape.
- Inspect HTTP logs for method, path, status, duration, and requestId.

## Future Improvements
- OpenTelemetry tracing and exporters.
- Metrics (latency, throughput, error rate).
- Centralized log aggregation.
