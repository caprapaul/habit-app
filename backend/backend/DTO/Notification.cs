using backend.Models;

namespace backend.DTO
{
    public class Notification
    {
        public string Event { get; set; }
        public NotificationPayload Payload { get; set; }

        public static class Events
        {
            public const string Created = "created";
            public const string Updated = "updated";
        }
    }
}
