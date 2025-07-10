import structlog, logging, os

ENV_MODE = os.getenv("ENV_MODE", "LOCAL")

# Compatibility with Python 3.10
def get_logging_level(level_name: str) -> int:
    level_mapping = {
        'CRITICAL': logging.CRITICAL,
        'FATAL': logging.FATAL,
        'ERROR': logging.ERROR,
        'WARN': logging.WARNING,
        'WARNING': logging.WARNING,
        'INFO': logging.INFO,
        'DEBUG': logging.DEBUG,
        'NOTSET': logging.NOTSET,
    }
    return level_mapping.get(level_name.upper(), logging.DEBUG)

LOGGING_LEVEL = get_logging_level(os.getenv("LOGGING_LEVEL", "DEBUG"))

renderer = [structlog.processors.JSONRenderer()]
if ENV_MODE.lower() == "local".lower() or ENV_MODE.lower() == "staging".lower():
    renderer = [structlog.dev.ConsoleRenderer()]

structlog.configure(
    processors=[
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.dict_tracebacks,
        structlog.processors.CallsiteParameterAdder(
            {
                structlog.processors.CallsiteParameter.FILENAME,
                structlog.processors.CallsiteParameter.FUNC_NAME,
                structlog.processors.CallsiteParameter.LINENO,
            }
        ),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.contextvars.merge_contextvars,
        *renderer,
    ],
    cache_logger_on_first_use=True,
    wrapper_class=structlog.make_filtering_bound_logger(LOGGING_LEVEL),
)

logger: structlog.stdlib.BoundLogger = structlog.get_logger()
