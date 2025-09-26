using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Threading.Tasks;

namespace GUI.Tests
{
    [TestClass]
    public class SimpleTest
    {
        [TestMethod]
        public async Task SimpleTestMethod()
        {
            // Simple test to validate test infrastructure
            var result = await Task.FromResult(42);
            Assert.AreEqual(42, result);
        }

        [TestMethod]
        public void SynchronousTest()
        {
            // Simple synchronous test
            var value = 100;
            Assert.IsTrue(value > 0);
        }
    }
}