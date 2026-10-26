import type { SwapSpot } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

export function SpotForm({
  action,
  spot,
  error,
  spotLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  spot?: SwapSpot;
  error?: string;
  spotLabel: string;
}) {
  return (
    <form action={action} encType="multipart/form-data" className="max-w-2xl space-y-4">
      {spot ? <input type="hidden" name="id" value={spot.id} /> : null}
      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required defaultValue={spot?.name} />
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" required defaultValue={spot?.address} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" defaultValue={spot?.city ?? ""} />
        </div>
        <div>
          <Label htmlFor="region">State or region</Label>
          <Input id="region" name="region" defaultValue={spot?.region ?? ""} />
        </div>
        <div>
          <Label htmlFor="postalCode">Postal code</Label>
          <Input id="postalCode" name="postalCode" defaultValue={spot?.postalCode ?? ""} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="latitude">Latitude</Label>
          <Input id="latitude" name="latitude" defaultValue={spot?.latitude ?? ""} placeholder="27.95" />
        </div>
        <div>
          <Label htmlFor="longitude">Longitude</Label>
          <Input id="longitude" name="longitude" defaultValue={spot?.longitude ?? ""} placeholder="-82.46" />
        </div>
      </div>
      <div>
        <Label htmlFor="notes">Notes for people meeting here</Label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={spot?.notes ?? ""} />
      </div>
      <div>
        <Label htmlFor="meetingTip">Meeting tip shown in chat</Label>
        <Textarea id="meetingTip" name="meetingTip" rows={2} defaultValue={spot?.meetingTip ?? ""} />
      </div>
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" name="cameraMonitored" defaultChecked={spot?.cameraMonitored} /> Camera monitored</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="wellLit" defaultChecked={spot?.wellLit} /> Well lit</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="publicIndoor" defaultChecked={spot?.publicIndoor} /> Public indoor</label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="hidden" name="active" value="off" />
        <input type="checkbox" name="active" value="on" defaultChecked={spot?.active ?? true} /> Active
      </label>
      {spot?.photoUrl ? (
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={spot.photoUrl} alt="" className="h-32 rounded-lg object-cover" />
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input type="checkbox" name="removePhoto" /> Remove photo
          </label>
        </div>
      ) : null}
      <div>
        <Label htmlFor="photo">Cover photo</Label>
        <input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm" />
      </div>
      <Button type="submit">{spot ? `Save ${spotLabel.toLowerCase()}` : `Add ${spotLabel.toLowerCase()}`}</Button>
    </form>
  );
}
