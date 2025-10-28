using FuzzySharp;
using F23.StringSimilarity;
using System;

namespace TestSerach
{
    public static class HybridMatcher
    {
        public static double HybridScore(string query, string candidate)
        {
            // Normalize
            query = query.ToLower().Trim();
            candidate = candidate.ToLower().Trim();

            var queryTokens = query.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            double tokenScoreSum = 0;

            var jaroCalc = new JaroWinkler();

            foreach (var token in queryTokens)
            {
                
                double jaro = jaroCalc.Similarity(token, candidate) * 100;
                double fuzzy = Fuzz.PartialRatio(token, candidate);
                double best = Math.Max(jaro, fuzzy);
                tokenScoreSum += best;
            }

           
            double avgTokenScore = tokenScoreSum / queryTokens.Length;

            double fullJaro = jaroCalc.Similarity(query, candidate) * 100;
            double tokenSort = Fuzz.TokenSortRatio(query, candidate);

           
            double final = (0.6 * avgTokenScore) + (0.25 * fullJaro) + (0.15 * tokenSort);
            return final;
        }
    }
}
