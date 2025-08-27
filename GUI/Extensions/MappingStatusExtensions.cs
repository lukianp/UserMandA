using System;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Extensions
{
    public static class MappingStatusExtensions
    {
        public static bool IsSkipped(this string status)
        {
            return Enum.TryParse<MappingStatus>(status, out var result) && 
                   result == MappingStatus.Skipped;
        }

        public static bool IsMapped(this string status)
        {
            return Enum.TryParse<MappingStatus>(status, out var result) && 
                   result == MappingStatus.Mapped;
        }

        public static bool IsPending(this string status)
        {
            return Enum.TryParse<MappingStatus>(status, out var result) && 
                   result == MappingStatus.Pending;
        }
    }
}