using Serilog;

namespace AngularAPI.Services
{
    public class ErrorLogger
    {
        public static Serilog.ILogger ConfigureLogger()
        {
            return new LoggerConfiguration()
                .WriteTo.Console()
                .WriteTo.File("error.log", rollingInterval: RollingInterval.Day)
                .CreateLogger();
        }
    }
}
