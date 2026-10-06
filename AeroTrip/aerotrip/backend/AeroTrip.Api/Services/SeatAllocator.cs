namespace AeroTrip.Api.Services;

/// <summary>Assigns seats for a party, keeping them together in one row where possible and honouring window/aisle preference.</summary>
public static class SeatAllocator
{
    public static List<string> Allocate(CabinClass cabin, int count, SeatPreference preference, Random? random = null)
    {
        random ??= Random.Shared;
        var (firstRow, lastRow, letters) = cabin switch
        {
            CabinClass.Business => (1, 3, "ACDF"),
            CabinClass.PremiumEconomy => (5, 8, "ABCDEF"),
            _ => (12, 38, "ABCDEF")
        };

        var order = preference switch
        {
            SeatPreference.Window => cabin == CabinClass.Business ? "AC" + "FD" : "ABC" + "FED",
            SeatPreference.Aisle => cabin == CabinClass.Business ? "CA" + "DF" : "CBA" + "DEF",
            _ => random.Next(2) == 0 ? letters : new string(letters.Reverse().ToArray())
        };

        var row = random.Next(firstRow, lastRow + 1);
        var seats = new List<string>(count);
        var index = 0;
        while (seats.Count < count)
        {
            if (index == order.Length)
            {
                index = 0;
                row = row >= lastRow ? firstRow : row + 1;
            }
            seats.Add($"{row}{order[index++]}");
        }
        return seats;
    }
}
