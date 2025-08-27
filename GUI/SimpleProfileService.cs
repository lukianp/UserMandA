namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Simplified ProfileService for pipeline demonstration
    /// </summary>
    public class SimpleProfileService
    {
        private static SimpleProfileService? _instance;
        public static SimpleProfileService Instance => _instance ??= new SimpleProfileService();

        private SimpleProfileService() { }

        public string CurrentProfile => "ljpops";
        
        public string GetDataPath()
        {
            return @"C:\discoverydata\ljpops\Raw";
        }
        
        public string GetSecondaryDataPath()
        {
            return @"C:\discoverydata\Profiles\ljpops\Raw";
        }
    }
}