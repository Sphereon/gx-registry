import { TrustAnchor, TrustAnchorListDocument } from '../../schemas'

export abstract class TrustAnchorListParser {
  /**
   * Parse the list of this TrustAnchorListParser for TrustAnchors.
   *
   * This function is used internally and in protected scope only. If you need to get the TrustAnchors from outside the class use {@link fetchTrustAnchors} instead.
   *
   * @returns {Promise<TrustAnchor[]>} a promise resolving to the found TrustAnchors in the list
   */
  public abstract getTrustAnchors(trustAnchorList: TrustAnchorListDocument): Promise<TrustAnchor[]>
}
