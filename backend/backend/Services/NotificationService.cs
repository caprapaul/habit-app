using System;
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using backend.DTO;
using backend.Extensions;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace backend.Services
{
    public class NotificationService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ConcurrentDictionary<(string, string), WebSocket> _subscribers = new();

        public NotificationService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task AddSubscriber(string userId, WebSocket subscriber)
        {
            var subscriberId = Guid.NewGuid().ToString();
            _subscribers.TryAdd((userId, subscriberId), subscriber);

            WebSocketReceiveResult result =
                await subscriber.ReceiveAsync(ArraySegment<byte>.Empty, CancellationToken.None);

            while (!result.CloseStatus.HasValue)
            {
                result = await subscriber.ReceiveAsync(ArraySegment<byte>.Empty, CancellationToken.None);
            }

            _subscribers.TryRemove((userId, subscriberId), out _);
        }

        // removes a notifications subscriber
        public void RemoveSubscriber((string userId, string subscriberId) tuple)
        {
            _subscribers.TryRemove(tuple, out _);
        }

        // sends a notification to all subscribers
        public async Task SendNotificationAsync(Notification notification)
        {
            string currentUserId = _httpContextAccessor.GetUserId();
            
            // send the notification to all subscribers
            foreach (((string userId, _), WebSocket subscriber) in _subscribers)
            {
                if (subscriber.State != WebSocketState.Open)
                {
                    continue;
                }

                if (userId != currentUserId)
                {
                    continue;
                }

                string jsonNotification = JsonConvert.SerializeObject(notification, new JsonSerializerSettings
                {
                    ContractResolver = new DefaultContractResolver
                    {
                        NamingStrategy = new CamelCaseNamingStrategy()
                    }
                });
                await SendStringAsync(subscriber, jsonNotification);
            }
        }

        // sends a string via web socket communication
        private async Task SendStringAsync(WebSocket socket, string data, CancellationToken ct = default)
        {
            byte[] buffer = Encoding.UTF8.GetBytes(data);
            var segment = new ArraySegment<byte>(buffer);

            await socket.SendAsync(segment, WebSocketMessageType.Text, true, ct);
        }
    }
}
