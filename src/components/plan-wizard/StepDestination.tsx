import { Button } from "@/components/ui/button";
import type { CityDto } from "@/types";

interface StepDestinationProps {
  cities: CityDto[];
  selectedCityId: string | null;
  onSelect: (cityId: string) => void;
}

export default function StepDestination({ cities, selectedCityId, onSelect }: StepDestinationProps) {
  // Sort cities alphabetically by name
  const sortedCities = [...cities].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">Where do you want to go?</h2>
        <p>Select your dream destination</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
        {sortedCities.map((city) => (
          <Button
            key={city.id}
            onClick={() => onSelect(city.id)}
            variant="outline"
            className="h-auto py-4 px-6 justify-start text-left whitespace-normal"
            data-testid={`btn-select-city-${city.id}`}
          >
            <span className="block">{city.name}</span>
          </Button>
        ))}
      </div>

      {sortedCities.length === 0 && (
        <div className="text-center py-8">
          <p>No destinations available at the moment.</p>
        </div>
      )}

      {selectedCityId !== null && (
        <div className="mt-6 p-4 bg-primary/50 border rounded-lg">
          <p className="text-sm">
            <span>Selected destination: </span>
            <span className="font-semibold capitalize">{sortedCities.find((x) => x.id == selectedCityId)?.name}</span>
          </p>
        </div>
      )}
    </div>
  );
}
