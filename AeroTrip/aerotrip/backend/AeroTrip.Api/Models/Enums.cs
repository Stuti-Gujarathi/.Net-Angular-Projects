namespace AeroTrip.Api.Models;

public enum UserRole { User, Admin }

public enum CabinClass { Economy, PremiumEconomy, Business }

public enum BookingStatus { PendingPayment, Confirmed, Cancelled, Expired }

public enum PaymentMethod { Card, Upi, NetBanking }

public enum PaymentStatus { Succeeded, Failed }

public enum DiscountType { Percentage, Flat }

public enum Gender { Male, Female, Other }

public enum PassengerType { Adult, Child }

public enum SeatPreference { NoPreference, Window, Aisle }
