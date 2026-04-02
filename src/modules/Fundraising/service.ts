import { CampaignService } from './services/campaign.service.js';
import { DonationService } from './services/donation.service.js';
import { RaffleService } from './services/raffle.service.js';

export { CampaignService } from './services/campaign.service.js';
export { DonationService } from './services/donation.service.js';
export { RaffleService } from './services/raffle.service.js';

/**
 * Unified facade so existing consumers (`import { FundraisingService }`)
 * continue to work without changes.
 */
export const FundraisingService = {
  // Campaign
  createCampaign: CampaignService.createCampaign,
  listCampaigns: CampaignService.listCampaigns,
  getCampaign: CampaignService.getCampaign,
  updateCampaign: CampaignService.updateCampaign,
  deleteCampaign: CampaignService.deleteCampaign,
  getCampaignProgress: CampaignService.getCampaignProgress,

  // Donation
  recordDonation: DonationService.recordDonation,
  listDonations: DonationService.listDonations,
  getDonation: DonationService.getDonation,
  deleteDonation: DonationService.deleteDonation,
  generateTaxCertificate: DonationService.generateTaxCertificate,
  getTaxCertificateById: DonationService.getTaxCertificateById,
  listTaxCertificatesBySchool: DonationService.listTaxCertificatesBySchool,
  listTaxCertificatesByDonor: DonationService.listTaxCertificatesByDonor,
  addDonorWallEntry: DonationService.addDonorWallEntry,
  listDonorWallByCampaign: DonationService.listDonorWallByCampaign,
  createRecurringDonation: DonationService.createRecurringDonation,
  listRecurringDonations: DonationService.listRecurringDonations,
  getRecurringDonation: DonationService.getRecurringDonation,
  cancelRecurringDonation: DonationService.cancelRecurringDonation,
  processRecurringDonations: DonationService.processRecurringDonations,

  // Raffle
  createRaffle: RaffleService.createRaffle,
  buyTickets: RaffleService.buyTickets,
  drawWinners: RaffleService.drawWinners,
  getTicketsByParent: RaffleService.getTicketsByParent,
} as const;
