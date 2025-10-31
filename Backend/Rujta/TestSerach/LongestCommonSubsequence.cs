using System;

namespace TestSearch
{
    public static class LongestCommonSubsequence
    {
        
        public static int GetLCSLength(string s1, string s2)
        {
            if (string.IsNullOrEmpty(s1) || string.IsNullOrEmpty(s2))
                return 0;

            int[,] dp = new int[s1.Length + 1, s2.Length + 1];

            for (int i = 1; i <= s1.Length; i++)
            {
                for (int j = 1; j <= s2.Length; j++)
                {
                    if (s1[i - 1] == s2[j - 1])
                        dp[i, j] = dp[i - 1, j - 1] + 1;
                    else
                        dp[i, j] = Math.Max(dp[i - 1, j], dp[i, j - 1]);
                }
            }

            return dp[s1.Length, s2.Length];
        }

       
        public static double GetSimilarityScore(string s1, string s2)
        {
            if (string.IsNullOrEmpty(s1) || string.IsNullOrEmpty(s2))
                return 0.0;

            int lcsLength = GetLCSLength(s1, s2);
            return (2.0 * lcsLength) / (s1.Length + s2.Length);
        }
    }
}
