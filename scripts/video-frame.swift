// Saves one frame of a video as a JPEG (used as the video's cover in the gallery).
// Usage: swift video-frame.swift <video> <out.jpg> [position 0–1, default 0.33]
import AVFoundation
import AppKit

let args = CommandLine.arguments
guard args.count >= 3 else {
    print("usage: swift video-frame.swift <video> <out.jpg> [position]")
    exit(1)
}

let asset = AVURLAsset(url: URL(fileURLWithPath: args[1]))
let position = args.count > 3 ? Double(args[3]) ?? 0.33 : 0.33
let generator = AVAssetImageGenerator(asset: asset)
generator.appliesPreferredTrackTransform = true
generator.requestedTimeToleranceBefore = .zero
generator.requestedTimeToleranceAfter = .zero

do {
    let seconds = max(0, CMTimeGetSeconds(asset.duration) * position)
    let frame = try generator.copyCGImage(at: CMTime(seconds: seconds, preferredTimescale: 600), actualTime: nil)
    let jpeg = NSBitmapImageRep(cgImage: frame).representation(using: .jpeg, properties: [.compressionFactor: 0.9])!
    try jpeg.write(to: URL(fileURLWithPath: args[2]))
} catch {
    print(error)
    exit(1)
}
