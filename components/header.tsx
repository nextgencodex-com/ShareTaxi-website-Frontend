"use client";

import { Button } from "@/components/ui/button";
import { User, Menu, X } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// --------------------------------------
// Payment Popup Component
// --------------------------------------
function PaymentPopup({ isOpen, onClose }: any) {
  const [form, setForm] = useState({
    bookingId: "",
    name: "",
    email: "",
    phone: "",
    countryCode: "+94",
    amount: "",
    note: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const countryCodes = ["+94", "+91", "+1", "+44", "+61", "+65", "+971", "+86"];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white p-6 rounded-2xl max-w-lg w-full relative shadow-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-xl font-bold text-center mb-4">
              Online Payment Form
            </h2>

            {/* Input Fields */}
            <div className="space-y-4">
              <input
                type="text"
                name="bookingId"
                placeholder="Booking ID"
                className="w-full border p-3 rounded-lg"
                onChange={handleChange}
              />

              <input
                type="text"
                name="name"
                placeholder="Full Name"
                className="w-full border p-3 rounded-lg"
                onChange={handleChange}
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full border p-3 rounded-lg"
                onChange={handleChange}
              />

              {/* Phone with Country Code */}
              <div className="flex gap-2">
                <select
                  name="countryCode"
                  className="border p-3 rounded-lg w-28"
                  onChange={handleChange}
                >
                  <option value="+93">+93 (AF - Afghanistan)</option>
                  <option value="+355">+355 (AL - Albania)</option>
                  <option value="+213">+213 (DZ - Algeria)</option>
                  <option value="+1-684">+1-684 (AS - American Samoa)</option>
                  <option value="+376">+376 (AD - Andorra)</option>
                  <option value="+244">+244 (AO - Angola)</option>
                  <option value="+1-264">+1-264 (AI - Anguilla)</option>
                  <option value="+672">+672 (AQ - Antarctica)</option>
                  <option value="+1-268">
                    +1-268 (AG - Antigua & Barbuda)
                  </option>
                  <option value="+54">+54 (AR - Argentina)</option>
                  <option value="+374">+374 (AM - Armenia)</option>
                  <option value="+297">+297 (AW - Aruba)</option>
                  <option value="+61">+61 (AU - Australia)</option>
                  <option value="+43">+43 (AT - Austria)</option>
                  <option value="+994">+994 (AZ - Azerbaijan)</option>

                  <option value="+1-242">+1-242 (BS - Bahamas)</option>
                  <option value="+973">+973 (BH - Bahrain)</option>
                  <option value="+880">+880 (BD - Bangladesh)</option>
                  <option value="+1-246">+1-246 (BB - Barbados)</option>
                  <option value="+375">+375 (BY - Belarus)</option>
                  <option value="+32">+32 (BE - Belgium)</option>
                  <option value="+501">+501 (BZ - Belize)</option>
                  <option value="+229">+229 (BJ - Benin)</option>
                  <option value="+1-441">+1-441 (BM - Bermuda)</option>
                  <option value="+975">+975 (BT - Bhutan)</option>
                  <option value="+591">+591 (BO - Bolivia)</option>
                  <option value="+599">
                    +599 (BQ - Caribbean Netherlands)
                  </option>
                  <option value="+387">+387 (BA - Bosnia & Herzegovina)</option>
                  <option value="+267">+267 (BW - Botswana)</option>
                  <option value="+55">+55 (BR - Brazil)</option>
                  <option value="+246">
                    +246 (IO - British Indian Ocean Territory)
                  </option>
                  <option value="+1-284">
                    +1-284 (VG - British Virgin Islands)
                  </option>
                  <option value="+673">+673 (BN - Brunei)</option>
                  <option value="+359">+359 (BG - Bulgaria)</option>
                  <option value="+226">+226 (BF - Burkina Faso)</option>
                  <option value="+257">+257 (BI - Burundi)</option>

                  <option value="+855">+855 (KH - Cambodia)</option>
                  <option value="+237">+237 (CM - Cameroon)</option>
                  <option value="+1">+1 (CA - Canada)</option>
                  <option value="+238">+238 (CV - Cape Verde)</option>
                  <option value="+1-345">+1-345 (KY - Cayman Islands)</option>
                  <option value="+236">
                    +236 (CF - Central African Republic)
                  </option>
                  <option value="+235">+235 (TD - Chad)</option>
                  <option value="+56">+56 (CL - Chile)</option>
                  <option value="+86">+86 (CN - China)</option>
                  <option value="+61">+61 (CX - Christmas Island)</option>
                  <option value="+61">+61 (CC - Cocos Islands)</option>
                  <option value="+57">+57 (CO - Colombia)</option>
                  <option value="+269">+269 (KM - Comoros)</option>
                  <option value="+682">+682 (CK - Cook Islands)</option>
                  <option value="+506">+506 (CR - Costa Rica)</option>
                  <option value="+385">+385 (HR - Croatia)</option>
                  <option value="+53">+53 (CU - Cuba)</option>
                  <option value="+599">+599 (CW - Curaçao)</option>
                  <option value="+357">+357 (CY - Cyprus)</option>
                  <option value="+420">+420 (CZ - Czechia)</option>

                  <option value="+243">+243 (CD - DR Congo)</option>
                  <option value="+45">+45 (DK - Denmark)</option>
                  <option value="+253">+253 (DJ - Djibouti)</option>
                  <option value="+1-767">+1-767 (DM - Dominica)</option>
                  <option value="+1-809">
                    +1-809 (DO - Dominican Republic)
                  </option>

                  <option value="+670">+670 (TL - East Timor)</option>
                  <option value="+593">+593 (EC - Ecuador)</option>
                  <option value="+20">+20 (EG - Egypt)</option>
                  <option value="+503">+503 (SV - El Salvador)</option>
                  <option value="+240">+240 (GQ - Equatorial Guinea)</option>
                  <option value="+291">+291 (ER - Eritrea)</option>
                  <option value="+372">+372 (EE - Estonia)</option>
                  <option value="+268">+268 (SZ - Eswatini)</option>
                  <option value="+251">+251 (ET - Ethiopia)</option>

                  <option value="+500">+500 (FK - Falkland Islands)</option>
                  <option value="+298">+298 (FO - Faroe Islands)</option>
                  <option value="+679">+679 (FJ - Fiji)</option>
                  <option value="+358">+358 (FI - Finland)</option>
                  <option value="+33">+33 (FR - France)</option>

                  <option value="+594">+594 (GF - French Guiana)</option>
                  <option value="+689">+689 (PF - French Polynesia)</option>

                  <option value="+241">+241 (GA - Gabon)</option>
                  <option value="+220">+220 (GM - Gambia)</option>
                  <option value="+995">+995 (GE - Georgia)</option>
                  <option value="+49">+49 (DE - Germany)</option>
                  <option value="+233">+233 (GH - Ghana)</option>
                  <option value="+350">+350 (GI - Gibraltar)</option>
                  <option value="+30">+30 (GR - Greece)</option>
                  <option value="+299">+299 (GL - Greenland)</option>
                  <option value="+1-473">+1-473 (GD - Grenada)</option>
                  <option value="+590">+590 (GP - Guadeloupe)</option>
                  <option value="+1-671">+1-671 (GU - Guam)</option>
                  <option value="+502">+502 (GT - Guatemala)</option>
                  <option value="+44-1481">+44-1481 (GG - Guernsey)</option>
                  <option value="+224">+224 (GN - Guinea)</option>
                  <option value="+245">+245 (GW - Guinea-Bissau)</option>
                  <option value="+592">+592 (GY - Guyana)</option>

                  <option value="+509">+509 (HT - Haiti)</option>
                  <option value="+504">+504 (HN - Honduras)</option>
                  <option value="+852">+852 (HK - Hong Kong)</option>
                  <option value="+36">+36 (HU - Hungary)</option>

                  <option value="+354">+354 (IS - Iceland)</option>
                  <option value="+91">+91 (IN - India)</option>
                  <option value="+62">+62 (ID - Indonesia)</option>
                  <option value="+98">+98 (IR - Iran)</option>
                  <option value="+964">+964 (IQ - Iraq)</option>
                  <option value="+353">+353 (IE - Ireland)</option>
                  <option value="+44-1624">+44-1624 (IM - Isle of Man)</option>
                  <option value="+972">+972 (IL - Israel)</option>
                  <option value="+39">+39 (IT - Italy)</option>

                  <option value="+225">+225 (CI - Ivory Coast)</option>

                  <option value="+1-876">+1-876 (JM - Jamaica)</option>
                  <option value="+81">+81 (JP - Japan)</option>
                  <option value="+44-1534">+44-1534 (JE - Jersey)</option>
                  <option value="+962">+962 (JO - Jordan)</option>

                  <option value="+7">+7 (KZ - Kazakhstan)</option>
                  <option value="+254">+254 (KE - Kenya)</option>
                  <option value="+686">+686 (KI - Kiribati)</option>
                  <option value="+383">+383 (XK - Kosovo)</option>
                  <option value="+965">+965 (KW - Kuwait)</option>
                  <option value="+996">+996 (KG - Kyrgyzstan)</option>

                  <option value="+856">+856 (LA - Laos)</option>
                  <option value="+371">+371 (LV - Latvia)</option>
                  <option value="+961">+961 (LB - Lebanon)</option>
                  <option value="+266">+266 (LS - Lesotho)</option>
                  <option value="+231">+231 (LR - Liberia)</option>
                  <option value="+218">+218 (LY - Libya)</option>
                  <option value="+423">+423 (LI - Liechtenstein)</option>
                  <option value="+370">+370 (LT - Lithuania)</option>
                  <option value="+352">+352 (LU - Luxembourg)</option>

                  <option value="+853">+853 (MO - Macau)</option>
                  <option value="+389">+389 (MK - North Macedonia)</option>
                  <option value="+261">+261 (MG - Madagascar)</option>
                  <option value="+265">+265 (MW - Malawi)</option>
                  <option value="+60">+60 (MY - Malaysia)</option>
                  <option value="+960">+960 (MV - Maldives)</option>
                  <option value="+223">+223 (ML - Mali)</option>
                  <option value="+356">+356 (MT - Malta)</option>
                  <option value="+692">+692 (MH - Marshall Islands)</option>
                  <option value="+596">+596 (MQ - Martinique)</option>
                  <option value="+222">+222 (MR - Mauritania)</option>
                  <option value="+230">+230 (MU - Mauritius)</option>
                  <option value="+262">+262 (YT - Mayotte)</option>
                  <option value="+52">+52 (MX - Mexico)</option>
                  <option value="+691">+691 (FM - Micronesia)</option>
                  <option value="+373">+373 (MD - Moldova)</option>
                  <option value="+377">+377 (MC - Monaco)</option>
                  <option value="+976">+976 (MN - Mongolia)</option>
                  <option value="+382">+382 (ME - Montenegro)</option>
                  <option value="+1-664">+1-664 (MS - Montserrat)</option>
                  <option value="+212">+212 (MA - Morocco)</option>
                  <option value="+258">+258 (MZ - Mozambique)</option>
                  <option value="+95">+95 (MM - Myanmar)</option>

                  <option value="+264">+264 (NA - Namibia)</option>
                  <option value="+674">+674 (NR - Nauru)</option>
                  <option value="+977">+977 (NP - Nepal)</option>
                  <option value="+31">+31 (NL - Netherlands)</option>
                  <option value="+599">+599 (AN - Netherlands Antilles)</option>
                  <option value="+687">+687 (NC - New Caledonia)</option>
                  <option value="+64">+64 (NZ - New Zealand)</option>
                  <option value="+505">+505 (NI - Nicaragua)</option>
                  <option value="+227">+227 (NE - Niger)</option>
                  <option value="+234">+234 (NG - Nigeria)</option>
                  <option value="+683">+683 (NU - Niue)</option>
                  <option value="+672">+672 (NF - Norfolk Island)</option>
                  <option value="+850">+850 (KP - North Korea)</option>
                  <option value="+47">+47 (NO - Norway)</option>

                  <option value="+968">+968 (OM - Oman)</option>

                  <option value="+92">+92 (PK - Pakistan)</option>
                  <option value="+680">+680 (PW - Palau)</option>
                  <option value="+970">+970 (PS - Palestine)</option>
                  <option value="+507">+507 (PA - Panama)</option>
                  <option value="+675">+675 (PG - Papua New Guinea)</option>
                  <option value="+595">+595 (PY - Paraguay)</option>
                  <option value="+51">+51 (PE - Peru)</option>
                  <option value="+63">+63 (PH - Philippines)</option>
                  <option value="+870">+870 (PN - Pitcairn)</option>
                  <option value="+48">+48 (PL - Poland)</option>
                  <option value="+351">+351 (PT - Portugal)</option>
                  <option value="+1-787">+1-787 (PR - Puerto Rico)</option>

                  <option value="+974">+974 (QA - Qatar)</option>

                  <option value="+242">
                    +242 (CG - Republic of the Congo)
                  </option>
                  <option value="+40">+40 (RO - Romania)</option>
                  <option value="+7">+7 (RU - Russia)</option>
                  <option value="+250">+250 (RW - Rwanda)</option>

                  <option value="+590">+590 (BL - Saint Barthélemy)</option>
                  <option value="+290">+290 (SH - Saint Helena)</option>
                  <option value="+1-869">
                    +1-869 (KN - Saint Kitts & Nevis)
                  </option>
                  <option value="+1-758">+1-758 (LC - Saint Lucia)</option>
                  <option value="+590">+590 (MF - Saint Martin)</option>
                  <option value="+508">
                    +508 (PM - Saint Pierre & Miquelon)
                  </option>
                  <option value="+1-784">
                    +1-784 (VC - Saint Vincent & Grenadines)
                  </option>

                  <option value="+685">+685 (WS - Samoa)</option>
                  <option value="+378">+378 (SM - San Marino)</option>
                  <option value="+239">+239 (ST - Sao Tome & Principe)</option>

                  <option value="+966">+966 (SA - Saudi Arabia)</option>
                  <option value="+221">+221 (SN - Senegal)</option>
                  <option value="+381">+381 (RS - Serbia)</option>
                  <option value="+248">+248 (SC - Seychelles)</option>
                  <option value="+232">+232 (SL - Sierra Leone)</option>
                  <option value="+65">+65 (SG - Singapore)</option>
                  <option value="+421">+421 (SK - Slovakia)</option>
                  <option value="+386">+386 (SI - Slovenia)</option>
                  <option value="+677">+677 (SB - Solomon Islands)</option>
                  <option value="+252">+252 (SO - Somalia)</option>
                  <option value="+27">+27 (ZA - South Africa)</option>
                  <option value="+82">+82 (KR - South Korea)</option>
                  <option value="+211">+211 (SS - South Sudan)</option>
                  <option value="+34">+34 (ES - Spain)</option>
                  <option value="+94">+94 (LK - Sri Lanka)</option>
                  <option value="+249">+249 (SD - Sudan)</option>
                  <option value="+597">+597 (SR - Suriname)</option>
                  <option value="+46">+46 (SE - Sweden)</option>
                  <option value="+41">+41 (CH - Switzerland)</option>
                  <option value="+963">+963 (SY - Syria)</option>

                  <option value="+886">+886 (TW - Taiwan)</option>
                  <option value="+992">+992 (TJ - Tajikistan)</option>
                  <option value="+255">+255 (TZ - Tanzania)</option>
                  <option value="+66">+66 (TH - Thailand)</option>
                  <option value="+228">+228 (TG - Togo)</option>
                  <option value="+690">+690 (TK - Tokelau)</option>
                  <option value="+676">+676 (TO - Tonga)</option>
                  <option value="+1-868">
                    +1-868 (TT - Trinidad & Tobago)
                  </option>
                  <option value="+216">+216 (TN - Tunisia)</option>
                  <option value="+90">+90 (TR - Turkey)</option>
                  <option value="+993">+993 (TM - Turkmenistan)</option>
                  <option value="+1-649">+1-649 (TC - Turks & Caicos)</option>
                  <option value="+688">+688 (TV - Tuvalu)</option>

                  <option value="+256">+256 (UG - Uganda)</option>
                  <option value="+380">+380 (UA - Ukraine)</option>
                  <option value="+971">+971 (AE - United Arab Emirates)</option>
                  <option value="+44">+44 (GB - United Kingdom)</option>
                  <option value="+1">+1 (US - United States)</option>
                  <option value="+598">+598 (UY - Uruguay)</option>
                  <option value="+998">+998 (UZ - Uzbekistan)</option>

                  <option value="+678">+678 (VU - Vanuatu)</option>
                  <option value="+379">+379 (VA - Vatican)</option>
                  <option value="+58">+58 (VE - Venezuela)</option>
                  <option value="+84">+84 (VN - Vietnam)</option>
                  <option value="+1-284">
                    +1-284 (VG - British Virgin Islands)
                  </option>
                  <option value="+1-340">
                    +1-340 (VI - US Virgin Islands)
                  </option>

                  <option value="+681">+681 (WF - Wallis & Futuna)</option>
                  <option value="+212">+212 (EH - Western Sahara)</option>
                  <option value="+967">+967 (YE - Yemen)</option>

                  <option value="+260">+260 (ZM - Zambia)</option>
                  <option value="+263">+263 (ZW - Zimbabwe)</option>
                </select>

                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  className="w-full border p-3 rounded-lg"
                  onChange={handleChange}
                />
              </div>

              <input
                type="number"
                name="amount"
                placeholder="Enter Amount (LKR)"
                className="w-full border p-3 rounded-lg"
                onChange={handleChange}
              />

              <textarea
                name="note"
                placeholder="Payment Note"
                rows={3}
                className="w-full border p-3 rounded-lg"
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Payment Summary */}
            <div className="mt-6 p-4 bg-gray-100 rounded-xl">
              <h3 className="font-semibold text-lg mb-2">Payment Summary</h3>
              <p>
                <strong>Amount:</strong> LKR {form.amount || "0.00"}
              </p>
              <p>
                <strong>Currency:</strong> LKR
              </p>
              <p>
                <strong>Booking ID:</strong> {form.bookingId || "N/A"}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-between mt-6">
              <button
                onClick={onClose}
                className="px-5 py-3 bg-gray-300 hover:bg-gray-400 rounded-lg"
              >
                Cancel Payment
              </button>

              <button className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg">
                Pay Now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --------------------------------------
// Header Component
// --------------------------------------
interface HeaderProps {
  isLoggedIn?: boolean;
  onLoginClick?: () => void;
  onAdminLoginClick?: () => void;
}

export function Header({ isLoggedIn = false, onLoginClick }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const tNav = useTranslations("nav");
  const router = useRouter();

  return (
    <>
      <header className="relative z-50 pt-4 md:pt-6 px-4 md:px-6">
        <div className="bg-black rounded-full px-4 md:px-8 py-3 md:py-4 max-w-6xl mx-auto relative shadow-lg">
          <div className="flex items-center justify-between">
            <img src="/images/logo.png" className="lg:hidden h-6 md:h-8" />

            <span className="lg:hidden absolute inset-0 flex items-center justify-center text-white font-medium text-base md:text-lg pointer-events-none">
              Share Taxi Sri Lanka
            </span>

            <div className="hidden lg:flex items-center gap-3">
              <img src="/images/logo.png" className="h-8 md:h-10" />
              <span className="text-white font-semibold text-lg">
                Share Taxi Sri Lanka
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <a
                href="#hero-section"
                className="text-yellow-400 text-sm font-medium"
              >
                {tNav("home")}
              </a>
              <a
                href="#booking-section"
                className="text-white hover:text-yellow-400 text-sm"
              >
                {tNav("bookTaxi")}
              </a>
              <a
                href="#shared-rides-section"
                className="text-white hover:text-yellow-400 text-sm"
              >
                {tNav("sharedRides")}
              </a>
              <a
                href="#vehicle-options-section"
                className="text-white hover:text-yellow-400 text-sm"
              >
                {tNav("carOption")}
              </a>
            </nav>

            {/* Desktop Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Online Payment Button */}
              <Button
                onClick={() => setIsPaymentOpen(true)}
                className="bg-yellow-500 text-black px-4 py-2 rounded-full hover:bg-yellow-600"
              >
                Online Payment
              </Button>

              <Button
                onClick={() => {
                  if (isLoggedIn) router.push("/user-profile");
                  else onLoginClick?.();
                }}
                className="w-10 h-10 rounded-full bg-yellow-400 hover:bg-yellow-500 p-0"
              >
                <User className="h-5 w-5 text-black" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              className="lg:hidden text-white p-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-x-0 top-[70px] bg-black/90 backdrop-blur-md z-30 lg:hidden rounded-b-2xl shadow-2xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="p-5 pb-6 space-y-3">
              {[
                {
                  href: "#hero-section",
                  label: tNav("home"),
                  color: "text-yellow-400",
                },
                { href: "#booking-section", label: tNav("bookTaxi") },
                { href: "#shared-rides-section", label: tNav("sharedRides") },
                { href: "#vehicle-options-section", label: tNav("carOption") },
              ].map((link, i) => (
                <motion.a
                  key={i}
                  href={link.href}
                  className="block bg-gray-900/80 rounded-2xl px-5 py-4 border border-gray-800/70 text-center font-semibold text-white"
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <h3 className={link.color}>{link.label}</h3>
                </motion.a>
              ))}

              {/* Mobile Online Payment Button */}
              <motion.button
                className="block w-full bg-yellow-500 text-black font-semibold rounded-2xl px-5 py-4"
                whileHover={{ scale: 1.03 }}
                onClick={() => {
                  setIsPaymentOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                Online Payment
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Popup */}
      <PaymentPopup
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
      />
    </>
  );
}
