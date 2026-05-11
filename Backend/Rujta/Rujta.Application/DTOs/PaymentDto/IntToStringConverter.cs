using System.Text.Json;
using System.Text.Json.Serialization;

namespace Rujta.Application.DTOs.PaymentDto
{
    public class IntToStringConverter : JsonConverter<string>
    {
        public override string Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            return reader.TokenType switch
            {
                JsonTokenType.Number => reader.GetInt64().ToString(),
                JsonTokenType.String => reader.GetString() ?? string.Empty,
                _ => string.Empty
            };
        }

        public override void Write(Utf8JsonWriter writer, string value, JsonSerializerOptions options)
            => writer.WriteStringValue(value);
    }
}