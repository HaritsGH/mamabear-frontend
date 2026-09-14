"use client";

import React from "react";
import { useAddressForm } from "../../hooks/useCreateAddressForm";
import { PlusIcon, X } from "lucide-react";

const labelVals = ["Rumah", "Kantor", "Sekolah", "Apartemen", "Toko", "Gudang", "Orang Tua", "Keluarga"];
const MAX_LABEL = 3;
/**
 * Address Creation Form matching the provided MamaBear UI specifications.
 */
export function AddressForm() {
  const { register, handleSubmit, onSubmit, errors, isSubmitting, dropdowns, loaders, successMessage, setValue } = useAddressForm();
  const [label, setLabel] = React.useState<string[]>([]);
  const [selectedLabel, setSelectedLabel] = React.useState<string>("");

  const handleAddButton = (newLabel: string) => {
    if (!newLabel || label.includes(newLabel) || label.length >= MAX_LABEL) return;
    const next = [...label, newLabel];
    setLabel(next);
    setValue("label", next.join(", "));
    setSelectedLabel("");
  };

  const handleDeleteButton = (index: number) => {
    const next = label.filter((_, i) => i !== index);
    setLabel(next);
    setValue("label", next.join(", "));
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-6 rounded-lg">
      {successMessage && <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md text-font-2">{successMessage}</div>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        {/* ROW 1: Name and Phone Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
          <div className="flex flex-col">
            <label className="text-[var(--mama-brown)] font-bold text-font-2 mb-2">Nama</label>
            <input
              type="text"
              placeholder="Mama Bear"
              className="w-full border-0 border-b border-gray-300 focus:border-[var(--mama-hot-pink)] focus:ring-0 px-0 py-2 bg-transparent text-font-2 text-gray-800 outline-none transition-colors"
              {...register("name", { required: "Nama wajib diisi" })}
            />
            {errors.name && <span className="text-red-500 text-font-1 mt-1">{errors.name.message}</span>}
          </div>

          <div className="flex flex-col">
            <label className="text-[var(--mama-brown)] font-bold text-font-2 mb-2">Nomor Handphone</label>
            <div className="flex items-center border-b border-gray-300 focus-within:border-[var(--mama-hot-pink)] transition-colors">
              <span className="text-[var(--mama-brown)] font-medium text-font-2 mr-2 py-2">+62</span>
              <input
                type="tel"
                placeholder="123456789"
                className="w-full border-0 focus:ring-0 px-0 py-2 bg-transparent text-font-2 text-gray-800 outline-none"
                {...register("phoneNumber", {
                  required: "Nomor handphone wajib diisi",
                  onChange: (e) => {
                    let v = e.target.value.replace(/\D/g, "");
                    if (v && v[0] != "8") v = v.replace(/^[^8]/, "");
                    e.target.value = v.slice(0, 12);
                  },
                  pattern: { value: /^8\d{7,11}$/, message: "Nomor HP harus diawali 8 (contoh: +62812345678)" },
                })}
              />
            </div>
            {errors.phoneNumber && <span className="text-red-500 text-font-1 mt-1">{errors.phoneNumber.message}</span>}
          </div>
        </div>

        {/* ROW 2: Province and City */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
          <div className="flex flex-col">
            <label className="text-[var(--mama-brown)] font-bold text-font-2 mb-2">Provinsi</label>
            <select
              className="w-full border-0 border-b border-gray-300 focus:border-[var(--mama-hot-pink)] focus:ring-0 px-0 py-2 bg-transparent text-font-2 text-gray-800 outline-none transition-colors appearance-none cursor-pointer"
              {...register("provinceId", {
                required: "Provinsi wajib dipilih",
              })}
              disabled={loaders.isLoadingProvinces}
            >
              <option value="">{loaders.isLoadingProvinces ? "Memuat..." : "Pilih Provinsi"}</option>
              {dropdowns.provinces.map((prov) => (
                <option key={prov.id} value={prov.id}>
                  {prov.name}
                </option>
              ))}
            </select>
            {errors.provinceId && <span className="text-red-500 text-font-1 mt-1">{errors.provinceId.message}</span>}
          </div>

          <div className="flex flex-col">
            <label className="text-[var(--mama-brown)] font-bold text-font-2 mb-2">Kota</label>
            <select
              className="w-full border-0 border-b border-gray-300 focus:border-[var(--mama-hot-pink)] focus:ring-0 px-0 py-2 bg-transparent text-font-2 text-gray-800 outline-none transition-colors appearance-none cursor-pointer"
              {...register("cityId", { required: "Kota wajib dipilih" })}
              disabled={!dropdowns.cities.length || loaders.isLoadingCities}
            >
              <option value="">{loaders.isLoadingCities ? "Memuat..." : "Pilih Kota"}</option>
              {dropdowns.cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ROW 3: District and Zip Code */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
          <div className="flex flex-col">
            <label className="text-[var(--mama-brown)] font-bold text-font-2 mb-2">Kecamatan</label>
            <select
              className="w-full border-0 border-b border-gray-300 focus:border-[var(--mama-hot-pink)] focus:ring-0 px-0 py-2 bg-transparent text-font-2 text-gray-800 outline-none transition-colors appearance-none cursor-pointer"
              {...register("districtId", {
                required: "Kecamatan wajib dipilih",
              })}
              disabled={!dropdowns.districts.length || loaders.isLoadingDistricts}
            >
              <option value="">{loaders.isLoadingDistricts ? "Memuat..." : "Pilih Kecamatan"}</option>
              {dropdowns.districts.map((dist) => (
                <option key={dist.id} value={dist.id}>
                  {dist.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-[var(--mama-brown)] font-bold text-font-2 mb-2">Kodepos</label>
            {/* Hidden subdistrict selector used to fetch zip code under the hood, but exposing zip code field directly */}
            <div className="flex gap-2">
              <select
                className="w-1/2 border-0 border-b border-gray-300 focus:border-[var(--mama-hot-pink)] focus:ring-0 px-0 py-2 bg-transparent text-font-2 text-gray-800 outline-none transition-colors appearance-none cursor-pointer"
                {...register("subdistrictId", {
                  required: "Kelurahan wajib dipilih",
                })}
                disabled={!dropdowns.subdistricts.length || loaders.isLoadingSubdistricts}
              >
                <option value="">{loaders.isLoadingSubdistricts ? "Memuat..." : "Kelurahan"}</option>
                {dropdowns.subdistricts.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
              <input type="text" placeholder="40286" readOnly className="w-1/2 border-0 border-b border-gray-300 px-0 py-2 bg-transparent text-font-2 text-gray-500 outline-none cursor-not-allowed" {...register("zipCode")} />
            </div>
            {errors.subdistrictId && <span className="text-red-500 text-font-1 mt-1">{errors.subdistrictId.message}</span>}
          </div>
        </div>

        {/* ROW 4: Street Details */}
        <div className="flex flex-col">
          <label className="text-[var(--mama-brown)] font-bold text-font-2 mb-2">Nama Jalan, Gedung, no Rumah</label>
          <input
            type="text"
            placeholder="Jl. Mama Bear Blok M no 12"
            className="w-full border-0 border-b border-gray-300 focus:border-[var(--mama-hot-pink)] focus:ring-0 px-0 py-2 bg-transparent text-font-2 text-gray-800 outline-none transition-colors"
            {...register("street", { required: "Alamat lengkap wajib diisi" })}
          />
          {errors.street && <span className="text-red-500 text-font-1 mt-1">{errors.street.message}</span>}
        </div>

        {/* ROW 5: Other Details */}
        <div className="flex flex-col">
          <label className="text-[var(--mama-brown)] font-bold text-font-2 mb-2">Detil Lainnya</label>
          <input
            type="text"
            placeholder="Sebelah Mama"
            className="w-full border-0 border-b border-gray-300 focus:border-[var(--mama-hot-pink)] focus:ring-0 px-0 py-2 bg-transparent text-font-2 text-gray-800 outline-none transition-colors"
            {...register("details")}
          />
        </div>

        {/* ROW 6: Label */}
        <div className="flex flex-col">
          <label className="text-[var(--mama-brown)] font-bold text-font-2 mb-2">Atur Sebagai</label>
          <div className="flex items-center gap-5 mt-2">
            {label.map((lbl, index) => (
              <span key={index} className="flex items-center gap-2 bg-[var(--mama-hot-pink)] rounded-lg px-2 py-1 text-white">
                {lbl}{" "}
                <button type="button" onClick={() => handleDeleteButton(index)}>
                  <X />
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1 mt-2">
            <input type="hidden" {...register("label", { required: "Label alamat wajib diisi" })} />
            <select
              className="w-full border-0 border-b border-gray-300 focus:border-[var(--mama-hot-pink)] focus:ring-0 px-0 py-2 bg-transparent text-font-2 text-gray-800 outline-none transition-colors appearance-none cursor-pointer"
              onChange={(e) => setSelectedLabel(e.target.value)}
              disabled={label.length >= MAX_LABEL}
            >
              <option value="">Pilih Label</option>
              {labelVals
                .filter((v) => !label.includes(v))
                .map((v, index) => (
                  <option key={index} value={v}>
                    {v}
                  </option>
                ))}
            </select>
            {errors.label && <span className="text-red-500 text-font-1 mt-1">{errors.label.message}</span>}
            <button
              disabled={label.length >= MAX_LABEL}
              type="button"
              className="ml-2 px-3 py-1 bg-[var(--mama-hot-pink)] text-white rounded-full text-font-1 hover:bg-[#c24467] transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--mama-hot-pink)]"
              onClick={() => handleAddButton(selectedLabel)}
            >
              <PlusIcon />
            </button>
          </div>
          {label.length >= MAX_LABEL && <span className="text-font-1 text-gray-500 mt-1">Maksimal 3 label per alamat</span>}
        </div>

        {/* ROW 7: Buttons */}
        <div className="grid grid-cols-2 gap-4 mt-8 pt-4">
          <button type="submit" disabled={isSubmitting} className="w-full bg-[var(--mama-hot-pink)] hover:bg-[#c24467] text-white font-bold py-3 px-4 rounded-full transition-colors disabled:opacity-70">
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}
